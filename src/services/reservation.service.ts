import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import type { CreateReservationInput } from "@/lib/validations";
import type { Prisma, Reservation, ReservationStatus } from "@prisma/client";

// ─── Constants ────────────────────────────────────────────────────────────
const RESERVATION_TTL_MINUTES = 10;
const IDEMPOTENCY_TTL_SECONDS = 86400; // 24 hours

// ─── Types ─────────────────────────────────────────────────────────────────
export type ReservationWithDetails = Reservation & {
  product: { id: string; name: string; sku: string; price: Prisma.Decimal; imageUrl: string | null };
  warehouse: { id: string; name: string; location: string };
};

export type ApiError = {
  code: "OUT_OF_STOCK" | "EXPIRED" | "NOT_FOUND" | "ALREADY_PROCESSED" | "VALIDATION" | "IDEMPOTENCY_CONFLICT";
  message: string;
  status: number;
};

// ─── Product Service ───────────────────────────────────────────────────────

/**
 * Returns all products enriched with per-warehouse stock availability.
 * availableUnits = totalUnits - reservedUnits
 * Lazy cleanup: expired PENDING reservations are released before computing availability.
 */
export async function getProducts() {
  // Lazy cleanup: release expired reservations before returning stock data.
  try {
    await releaseExpiredReservations();
  } catch (err) {
    console.error("[lazy-cleanup] Failed to release expired reservations:", err);
  }

  try {
    return await prisma.product.findMany({
      include: {
        stocks: {
          include: { warehouse: true },
          orderBy: { warehouse: { name: "asc" } },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("[db-error] Failed to fetch products:", err);
    return []; // Return empty array instead of crashing
  }
}

// ─── Warehouse Service ────────────────────────────────────────────────────

export async function getWarehouses() {
  try {
    return await prisma.warehouse.findMany({
      include: {
        stocks: {
          include: { product: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("[db-error] Failed to fetch warehouses:", err);
    return [];
  }
}

// ─── Reservation Service ───────────────────────────────────────────────────

/**
 * Creates a reservation with concurrency safety.
 *
 * CONCURRENCY STRATEGY: PostgreSQL Row-Level Locking (SELECT FOR UPDATE)
 * ─────────────────────────────────────────────────────────────────────
 * We chose DB-level locking over Redis distributed locks because:
 *
 * 1. SIMPLICITY: No additional infrastructure — lock lives where the data lives.
 * 2. CORRECTNESS: Lock is released atomically when the transaction commits or
 *    rolls back. No risk of lock orphaning on process crash.
 * 3. DURABILITY: The check-and-update is a single ACID transaction. There is
 *    no TOCTOU (time-of-check to time-of-use) race window.
 *
 * Flow:
 *   BEGIN
 *     SELECT * FROM stocks WHERE ... FOR UPDATE  ← acquires exclusive row lock
 *     IF availableUnits < quantity → ROLLBACK → 409
 *     UPDATE stocks SET reservedUnits += quantity
 *     INSERT INTO reservations ...
 *   COMMIT  ← lock released
 *
 * Any concurrent transaction trying to lock the same Stock row will WAIT until
 * the first transaction commits, then re-read the updated reservedUnits. This
 * guarantees only one reservation wins when stock is scarce.
 *
 * IDEMPOTENCY: If an Idempotency-Key header is provided, we store the result
 * in Redis for 24 hours and return the cached response on duplicate requests.
 */
export async function createReservation(
  input: CreateReservationInput,
  idempotencyKey?: string
): Promise<{ reservation: ReservationWithDetails } | { error: ApiError }> {
  // ── Idempotency check (BONUS) ────────────────────────────────────────────
  if (idempotencyKey) {
    try {
      const cached = await redis.get<string>(`idempotency:${idempotencyKey}`);
      if (cached) {
        const reservation = await prisma.reservation.findUnique({
          where: { id: cached },
          include: {
            product: { select: { id: true, name: true, sku: true, price: true } },
            warehouse: { select: { id: true, name: true, location: true } },
          },
        });
        if (reservation) {
          return { reservation: reservation as ReservationWithDetails };
        }
      }
    } catch (err) {
      console.error("[redis] Idempotency check failed:", err);
      // Continue without idempotency
    }
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // ── Step 1: Lock the stock row exclusively ───────────────────────
        // $queryRaw executes a raw SQL SELECT ... FOR UPDATE.
        // This prevents any concurrent transaction from reading stale
        // reservedUnits until this transaction commits.
        const [stockRow] = await tx.$queryRaw<
          Array<{
            id: string;
            totalUnits: number;
            reservedUnits: number;
          }>
        >`
          SELECT "id", "totalUnits", "reservedUnits"
          FROM "stocks"
          WHERE "productId" = ${input.productId}
            AND "warehouseId" = ${input.warehouseId}
          FOR UPDATE
        `;

        if (!stockRow) {
          throw new StockNotFoundError();
        }

        const available = stockRow.totalUnits - stockRow.reservedUnits;

        // ── Step 2: Check availability ──────────────────────────────────
        if (available < input.quantity) {
          throw new InsufficientStockError(available);
        }

        // ── Step 3: Atomically increment reservedUnits ──────────────────
        await tx.stock.update({
          where: { id: stockRow.id },
          data: { reservedUnits: { increment: input.quantity } },
        });

        // ── Step 4: Create the reservation record ───────────────────────
        const expiresAt = new Date(
          Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000
        );

        const reservation = await tx.reservation.create({
          data: {
            productId: input.productId,
            warehouseId: input.warehouseId,
            quantity: input.quantity,
            status: "PENDING",
            expiresAt,
            idempotencyKey: idempotencyKey ?? null,
          },
          include: {
            product: { select: { id: true, name: true, sku: true, price: true } },
            warehouse: { select: { id: true, name: true, location: true } },
          },
        });

        return reservation as ReservationWithDetails;
      },
      {
        isolationLevel: "ReadCommitted",
        timeout: 10000,
      }
    );

    // ── Cache idempotency key → reservation ID ───────────────────────────
    if (idempotencyKey) {
      try {
        await redis.set(`idempotency:${idempotencyKey}`, result.id, {
          ex: IDEMPOTENCY_TTL_SECONDS,
        });
      } catch (err) {
        console.error("[redis] Failed to set idempotency key:", err);
      }
    }

    return { reservation: result };
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return {
        error: {
          code: "OUT_OF_STOCK",
          message: `Only ${err.available} unit(s) available`,
          status: 409,
        },
      };
    }
    if (err instanceof StockNotFoundError) {
      return {
        error: {
          code: "NOT_FOUND",
          message: "Stock record not found for this product/warehouse combination",
          status: 404,
        },
      };
    }
    throw err; // let the API route handle unexpected errors
  }
}

/**
 * Confirms a reservation:
 * - Validates it is still PENDING and not expired
 * - Decrements both totalUnits and reservedUnits (net: totalUnits -= quantity)
 * - Marks status as CONFIRMED
 *
 * Also uses SELECT FOR UPDATE to prevent double-confirm race conditions.
 */
export async function confirmReservation(
  id: string
): Promise<{ reservation: ReservationWithDetails } | { error: ApiError }> {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Lock the reservation row
        const [reservation] = await tx.$queryRaw<Array<Reservation>>`
          SELECT * FROM "reservations" WHERE "id" = ${id} FOR UPDATE
        `;

        if (!reservation) {
          throw new ReservationNotFoundError();
        }

        if (reservation.status !== "PENDING") {
          throw new AlreadyProcessedError(reservation.status);
        }

        if (new Date(reservation.expiresAt) <= new Date()) {
          // Lazy release the stock since we have the lock anyway
          await tx.stock.updateMany({
            where: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
            data: { reservedUnits: { decrement: reservation.quantity } },
          });
          await tx.reservation.update({
            where: { id },
            data: { status: "RELEASED" },
          });
          throw new ExpiredError();
        }

        // Permanently reduce totalUnits and clear the reservation hold
        await tx.stock.updateMany({
          where: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
          data: {
            totalUnits: { decrement: reservation.quantity },
            reservedUnits: { decrement: reservation.quantity },
          },
        });

        const confirmed = await tx.reservation.update({
          where: { id },
          data: { status: "CONFIRMED" },
          include: {
            product: { select: { id: true, name: true, sku: true, price: true } },
            warehouse: { select: { id: true, name: true, location: true } },
          },
        });

        return confirmed as ReservationWithDetails;
      },
      { isolationLevel: "ReadCommitted", timeout: 10000 }
    );

    return { reservation: result };
  } catch (err) {
    if (err instanceof ReservationNotFoundError) {
      return { error: { code: "NOT_FOUND", message: "Reservation not found", status: 404 } };
    }
    if (err instanceof AlreadyProcessedError) {
      return {
        error: {
          code: "ALREADY_PROCESSED",
          message: `Reservation is already ${err.status.toLowerCase()}`,
          status: 409,
        },
      };
    }
    if (err instanceof ExpiredError) {
      return { error: { code: "EXPIRED", message: "Reservation has expired", status: 410 } };
    }
    throw err;
  }
}

/**
 * Releases a reservation:
 * - Decrements reservedUnits (stock becomes available again)
 * - Marks status as RELEASED
 */
export async function releaseReservation(
  id: string
): Promise<{ reservation: ReservationWithDetails } | { error: ApiError }> {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const [reservation] = await tx.$queryRaw<Array<Reservation>>`
          SELECT * FROM "reservations" WHERE "id" = ${id} FOR UPDATE
        `;

        if (!reservation) {
          throw new ReservationNotFoundError();
        }

        if (reservation.status !== "PENDING") {
          throw new AlreadyProcessedError(reservation.status);
        }

        await tx.stock.updateMany({
          where: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
          data: { reservedUnits: { decrement: reservation.quantity } },
        });

        const released = await tx.reservation.update({
          where: { id },
          data: { status: "RELEASED" },
          include: {
            product: { select: { id: true, name: true, sku: true, price: true } },
            warehouse: { select: { id: true, name: true, location: true } },
          },
        });

        return released as ReservationWithDetails;
      },
      { isolationLevel: "ReadCommitted", timeout: 10000 }
    );

    return { reservation: result };
  } catch (err) {
    if (err instanceof ReservationNotFoundError) {
      return { error: { code: "NOT_FOUND", message: "Reservation not found", status: 404 } };
    }
    if (err instanceof AlreadyProcessedError) {
      return {
        error: {
          code: "ALREADY_PROCESSED",
          message: `Reservation is already ${err.status.toLowerCase()}`,
          status: 409,
        },
      };
    }
    throw err;
  }
}

/**
 * Cron / lazy cleanup: finds all PENDING reservations past their expiresAt
 * and releases the blocked stock back.
 *
 * EXPIRY STRATEGY: Dual approach
 * ─────────────────────────────
 * 1. CRON (primary): GET /api/cron/cleanup runs every minute via Vercel Cron.
 *    This is the authoritative cleanup and handles bulk expiry efficiently.
 *
 * 2. LAZY (fallback): Called at the top of getProducts() and confirmReservation().
 *    Ensures stock is always accurate even if the cron is delayed.
 *
 * Trade-off: The lazy call adds a small overhead on product listing, but ensures
 * clients never see artificially inflated "reserved" counts.
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date();

  // Find expired PENDING reservations
  let expired = [];
  try {
    expired = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now },
      },
      select: { id: true, productId: true, warehouseId: true, quantity: true },
    });
  } catch (err) {
    console.error("[db-error] Failed to query expired reservations:", err);
    return 0;
  }

  if (expired.length === 0) return 0;

  // Process all in a single transaction for atomicity
  await prisma.$transaction([
    ...expired.map((r) =>
      prisma.stock.update({
        where: { productId_warehouseId: { productId: r.productId, warehouseId: r.warehouseId } },
        data: { reservedUnits: { decrement: r.quantity } },
      })
    ),
    prisma.reservation.updateMany({
      where: {
        id: { in: expired.map((r) => r.id) },
        status: "PENDING",
      },
      data: { status: "RELEASED" },
    }),
  ]);

  console.log(`[cleanup] Released ${expired.length} expired reservation(s)`);
  return expired.length;
}

export async function getReservation(
  id: string
): Promise<ReservationWithDetails | null> {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true, price: true, imageUrl: true } },
      warehouse: { select: { id: true, name: true, location: true } },
    },
  }) as unknown as ReservationWithDetails | null;
}

export async function getReservations() {
  try {
    return await prisma.reservation.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true, price: true, imageUrl: true } },
        warehouse: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as unknown as ReservationWithDetails[];
  } catch (err) {
    console.error("[db-error] Failed to fetch reservations:", err);
    return [];
  }
}

// ─── Domain Errors ─────────────────────────────────────────────────────────

class InsufficientStockError extends Error {
  constructor(public available: number) {
    super("Insufficient stock");
  }
}

class StockNotFoundError extends Error {
  constructor() {
    super("Stock not found");
  }
}

class ReservationNotFoundError extends Error {
  constructor() {
    super("Reservation not found");
  }
}

class AlreadyProcessedError extends Error {
  constructor(public status: ReservationStatus) {
    super("Reservation already processed");
  }
}

class ExpiredError extends Error {
  constructor() {
    super("Reservation expired");
  }
}

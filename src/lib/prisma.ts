import { PrismaClient } from "@prisma/client";

// ─── Singleton pattern for Prisma client ───────────────────────────────────
// In Next.js, hot-reload creates new module instances during development,
// which would exhaust the connection pool without this singleton pattern.
// The global object persists across hot-reloads.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/services/reservation.service";

/**
 * Cron cleanup endpoint — called every 5 minutes by Vercel Cron.
 *
 * EXPIRY STRATEGY: Cron-based cleanup (primary approach)
 * ──────────────────────────────────────────────────────
 * Vercel Cron Jobs invoke this endpoint on a schedule defined in vercel.json.
 * The CRON_SECRET env var protects against unauthorized invocations.
 *
 * This ensures expired reservations are released even if the lazy cleanup
 * in getProducts() is not triggered (e.g., during low-traffic periods).
 */
export async function POST(request: NextRequest) {
  // Verify the request is from Vercel Cron (or an authorized caller)
  const authHeader = request.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const released = await releaseExpiredReservations();
    return NextResponse.json({
      success: true,
      releasedCount: released,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON /api/cron/cleanup]", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}

// Also allow GET for manual triggering in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 405 });
  }
  const released = await releaseExpiredReservations();
  return NextResponse.json({ releasedCount: released });
}

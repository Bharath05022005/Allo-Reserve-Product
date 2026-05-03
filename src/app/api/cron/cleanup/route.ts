import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/services/reservation.service";

/**
 * Cron cleanup endpoint — called daily by Vercel Cron (Hobby plan limit).
 *
 * EXPIRY STRATEGY: Cron-based cleanup (primary approach)
 * ──────────────────────────────────────────────────────
 * Vercel Cron Jobs invoke this endpoint on a schedule defined in vercel.json.
 * The CRON_SECRET env var protects against unauthorized invocations.
 *
 * This ensures expired reservations are released even if the lazy cleanup
 * in getProducts() is not triggered (e.g., during low-traffic periods).
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

  // In production, we MUST have a secret and it MUST match.
  // In development, we allow bypass if no secret is configured.
  const isProd = process.env.NODE_ENV === "production";
  if (isProd || (process.env.CRON_SECRET && authHeader)) {
    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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

// Also allow POST for manual triggering if needed
export async function POST(request: NextRequest) {
  return GET(request);
}

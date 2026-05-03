import { Redis } from "@upstash/redis";

// ─── Upstash Redis client singleton ────────────────────────────────────────
// Used for idempotency key deduplication.
// Redis is NOT used for distributed locking here — we rely on PostgreSQL
// row-level locking (SELECT FOR UPDATE) for stock reservation atomicity.
// This is intentional: fewer moving parts, stronger consistency guarantees
// since the lock and data live in the same ACID-compliant transaction.

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

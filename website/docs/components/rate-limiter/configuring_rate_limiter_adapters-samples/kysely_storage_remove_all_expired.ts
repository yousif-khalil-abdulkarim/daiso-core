import { kyselyRateLimiterStorageAdapter } from "./kysely_storage_sqlite";

// Remove all expired rate-limiter records manually.
await kyselyRateLimiterStorageAdapter.removeAllExpired();

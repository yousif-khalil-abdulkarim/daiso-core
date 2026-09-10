import { kyselyRateLimiterStorageAdapter } from "./kysely_storage_sqlite.js";

// Remove all expired rate-limiter records manually.
await kyselyRateLimiterStorageAdapter.removeAllExpired();

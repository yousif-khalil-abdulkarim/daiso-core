import { kyselyCacheAdapter } from "./kysely_cache_sqlite";

// Remove all expired cache keys manually.
await kyselyCacheAdapter.removeAllExpired();

import { kyselyCacheAdapter } from "./kysely_cache_sqlite.js";

// Remove all expired cache keys manually.
await kyselyCacheAdapter.removeAllExpired();

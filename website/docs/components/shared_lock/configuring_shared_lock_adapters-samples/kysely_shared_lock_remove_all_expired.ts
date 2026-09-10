import { kyselySharedLockAdapter } from "./kysely_shared_lock_sqlite.js";

// Remove all expired shared-lock keys manually.
await kyselySharedLockAdapter.removeAllExpired();

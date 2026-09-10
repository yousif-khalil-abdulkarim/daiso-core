import { kyselyLockAdapter } from "./kysely_lock_sqlite.js";

// Remove all expired lock keys manually.
await kyselyLockAdapter.removeAllExpired();

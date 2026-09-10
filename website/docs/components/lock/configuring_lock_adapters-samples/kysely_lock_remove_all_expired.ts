import { kyselyLockAdapter } from "./kysely_lock_sqlite";

// Remove all expired lock keys manually.
await kyselyLockAdapter.removeAllExpired();

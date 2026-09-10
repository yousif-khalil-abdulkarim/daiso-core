import { kyselySharedLockAdapter } from "./kysely_shared_lock_sqlite";

// Remove all expired shared-lock keys manually.
await kyselySharedLockAdapter.removeAllExpired();

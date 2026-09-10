import { kyselySemaphoreAdapter } from "./kysely_semaphore_sqlite.js";

// Remove all expired semaphore keys manually.
await kyselySemaphoreAdapter.removeAllExpired();

import { kyselySemaphoreAdapter } from "./kysely_semaphore_sqlite";

// Remove all expired semaphore keys manually.
await kyselySemaphoreAdapter.removeAllExpired();

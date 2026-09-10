import { lock } from "./lock_create";

try {
    // This method will throw if the lock is not acquired
    await lock.acquireOrFail();
    // The critical section
} finally {
    await lock.release();
}

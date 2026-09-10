import { lock } from "./lock_create.js";

const hasAquired = await lock.acquire();
if (hasAquired) {
    try {
        // The critical section
    } finally {
        await lock.release();
    }
}

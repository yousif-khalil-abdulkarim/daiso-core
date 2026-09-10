import { semaphoreFactory } from "./semaphore_factory_initial_config.js";

const semaphore = semaphoreFactory.create("semaphore", {
    limit: 2,
    slotId: "my-slot-id",
});

const hasAcquire = await semaphore.acquire();
if (hasAcquire) {
    console.log("Shared resource");
    await semaphore.release();
}

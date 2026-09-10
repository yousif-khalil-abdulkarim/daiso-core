import { lockFactory } from "./lock_factory_initial_config.js";

const lock = lockFactory.create("lock", {
    lockId: "my-lock-id",
});

const hasAcquire = await lock.acquire();
if (hasAcquire) {
    console.log("Shared resource");
    await lock.release();
}

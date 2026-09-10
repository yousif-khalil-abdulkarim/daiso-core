import { sharedLockFactory } from "./shared_lock_factory_initial_config.js";

const sharedLock = sharedLockFactory.create("shared-lock", {
    limit: 2,
    lockId: "my-shared-lock-id",
});

const hasAcquire = await sharedLock.acquireWriter();
if (hasAcquire) {
    console.log("Shared resource");
    await sharedLock.releaseWriter();
}

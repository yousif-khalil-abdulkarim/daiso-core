import { sharedLockFactory } from "./shared_lock_factory_initial_config.js";

const sharedLock = sharedLockFactory.create("resource", {
    limit: 2,
});

await sharedLock.forceRelease();

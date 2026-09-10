import { sharedLockFactory } from "./shared_lock_factory_initial_config.js";

export const sharedLock = sharedLockFactory.create("shared-resource", {
    // You need to define a limit
    limit: 2,
});

import { sharedLockFactory } from "./shared_lock_factory_initial_config";

const sharedLock = sharedLockFactory.create("resource", {
    limit: 2,
});

await sharedLock.runWriterOrFail(async () => {
    // ... critical section
});

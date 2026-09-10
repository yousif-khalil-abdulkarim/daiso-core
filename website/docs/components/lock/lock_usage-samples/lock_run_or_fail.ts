import { lockFactory } from "./lock_factory_initial_config";

const lock = lockFactory.create("resource");

await lock.runOrFail(async () => {
    // ... critical section
});

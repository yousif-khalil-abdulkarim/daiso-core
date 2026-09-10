import { semaphoreFactory } from "./semaphore_factory_initial_config";

const semaphore = semaphoreFactory.create("resource", {
    limit: 2,
});

await semaphore.forceReleaseAll();

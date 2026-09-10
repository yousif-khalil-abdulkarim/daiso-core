import { semaphoreFactory } from "./semaphore_factory_initial_config.js";

const semaphore = semaphoreFactory.create("resource", {
    limit: 2,
});

await semaphore.forceReleaseAll();

import { semaphoreFactory } from "./semaphore_factory_initial_config";

export const semaphore = semaphoreFactory.create("shared-resource", {
    // You need to define a limit
    limit: 2,
});

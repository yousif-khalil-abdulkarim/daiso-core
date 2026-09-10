import { semaphoreFactory } from "./semaphore_factory_initial_config.js";
import { TimeSpan } from "eridu-tech/time-span";

const semaphore = semaphoreFactory.create("resource", {
    limit: 2,
    ttl: TimeSpan.fromMinutes(1),
});

await semaphore.refreshOrFail();

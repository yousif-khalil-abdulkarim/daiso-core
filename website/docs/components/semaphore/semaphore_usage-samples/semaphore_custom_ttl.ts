import { semaphoreFactory } from "./semaphore_factory_initial_config";
import { TimeSpan } from "eridu-tech/time-span";

const semaphore = semaphoreFactory.create("shared-resource", {
    // Default TTL is 5min if not overrided
    // If you set it to null it means semaphore will not expire and most be released manually.
    ttl: TimeSpan.fromSeconds(30),
    limit: 2,
});

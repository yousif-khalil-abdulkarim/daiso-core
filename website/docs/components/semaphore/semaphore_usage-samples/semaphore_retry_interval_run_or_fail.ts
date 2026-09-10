import { semaphoreFactory } from "./semaphore_factory_initial_config";
import { retryInterval } from "eridu-tech/resilience";
import { LimitReachedSemaphoreError } from "eridu-tech/semaphore/contracts";
import { use } from "eridu-tech/middleware";
import { TimeSpan } from "eridu-tech/time-span";

const semaphore = semaphoreFactory.create("resource", {
    limit: 2,
});

await use(async () => {
    await semaphore.runOrFail(async () => {
        // ... critical section
    });
}, [
    retryInterval({
        time: TimeSpan.fromMinutes(1),
        interval: TimeSpan.fromSeconds(1),
        errorPolicy: LimitReachedSemaphoreError,
    }),
])();

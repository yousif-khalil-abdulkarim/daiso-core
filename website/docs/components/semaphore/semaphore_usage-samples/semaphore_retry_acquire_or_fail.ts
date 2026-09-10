import { semaphoreFactory } from "./semaphore_factory_initial_config.js";
import { retry } from "eridu-tech/resilience";
import { LimitReachedSemaphoreError } from "eridu-tech/semaphore/contracts";
import { use } from "eridu-tech/middleware";

const semaphore = semaphoreFactory.create("semaphore", {
    limit: 2,
});

try {
    await use(async () => {
        await semaphore.acquireOrFail();
    }, [
        retry({
            maxAttempts: 4,
            errorPolicy: LimitReachedSemaphoreError,
        }),
    ])();
    // The critical section
} finally {
    await semaphore.release();
}

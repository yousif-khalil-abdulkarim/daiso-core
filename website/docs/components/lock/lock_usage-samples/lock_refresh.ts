import { lockFactory } from "./lock_factory_initial_config.js";
import { delay } from "eridu-tech/utilities";
import { TimeSpan } from "eridu-tech/time-span";

const lock = lockFactory.create("resource", {
    ttl: TimeSpan.fromMinutes(1),
});

async function doWork(): Promise<boolean> {
    // ... critical section
    return true;
}

const hasAcquired = await lock.acquire();
if (hasAcquired) {
    try {
        while (true) {
            await lock.refresh(TimeSpan.fromMinutes(1));
            const hasFinished = await doWork();
            if (hasFinished) {
                break;
            }
            await delay(TimeSpan.fromSeconds(1));
        }
    } finally {
        await lock.release();
    }
}

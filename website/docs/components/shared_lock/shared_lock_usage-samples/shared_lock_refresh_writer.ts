import { sharedLockFactory } from "./shared_lock_factory_initial_config";
import { delay } from "eridu-tech/utilities";
import { TimeSpan } from "eridu-tech/time-span";

const sharedLock = sharedLockFactory.create("resource", {
    limit: 2,
    ttl: TimeSpan.fromMinutes(1),
});

async function doWork(): Promise<boolean> {
    // ... critical section
    return true;
}

const hasAcquired = await sharedLock.acquireWriter();
if (hasAcquired) {
    try {
        while (true) {
            await sharedLock.refreshReader(TimeSpan.fromMinutes(1));
            const hasFinished = await doWork();
            if (hasFinished) {
                break;
            }
            await delay(TimeSpan.fromSeconds(1));
        }
    } finally {
        await sharedLock.releaseReader();
    }
}

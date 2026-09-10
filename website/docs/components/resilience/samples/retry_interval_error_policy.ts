import { retryInterval } from "eridu-tech/resilience";
import { use } from "eridu-tech/middleware";
import { TimeSpan } from "eridu-tech/time-span";

async function unstableFn(): Promise<number> {
    // We simulate a function that can throw unexpected errors
    if (Math.round(Math.random() * 1.5) === 0) {
        throw new Error("Unexpected error occurred");
    }
    return Math.round((Math.random() + 1) * 99);
}
const fn = use(unstableFn, [
    retryInterval({
        time: TimeSpan.fromSeconds(10),
        interval: TimeSpan.fromMilliseconds(500),
        // Will only retry errors that are not a TypeError
        errorPolicy: (error) => !(error instanceof TypeError),
    }),
]);

await fn();

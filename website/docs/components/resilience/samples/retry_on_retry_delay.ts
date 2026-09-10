import { retry } from "eridu-tech/resilience";
import { use } from "eridu-tech/middleware";

async function unstableFn(): Promise<number> {
    // We simulate a function that can throw unexpected errors
    if (Math.round(Math.random() * 1.5) === 0) {
        throw new Error("Unexpected error occurred");
    }
    return Math.round((Math.random() + 1) * 99);
}
const fn = use(unstableFn, [
    retry({
        maxAttempts: 4,
        onRetryDelay: (data) => console.log(data),
    }),
]);

await fn();

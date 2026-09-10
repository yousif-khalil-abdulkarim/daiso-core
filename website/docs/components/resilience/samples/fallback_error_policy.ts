import { fallback } from "eridu-tech/resilience";
import { use } from "eridu-tech/middleware";

async function unstableFn(): Promise<number> {
    // We simulate a function that can throw unexpected errors
    if (Math.round(Math.random() * 1.5) === 0) {
        throw new Error("Unexpected error occurred");
    }
    return Math.round((Math.random() + 1) * 99);
}
const fn = use(unstableFn, [
    fallback({
        fallbackValue: 1,
        // Will only fallback errors that are not a TypeError
        errorPolicy: (error) => !(error instanceof TypeError),
    }),
]);

await fn();

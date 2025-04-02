import { observe, LazyPromise } from "@/async/_module-exports.js";
import { AsyncHooks, TimeSpan } from "@/utilities/_module-exports.js";

await new AsyncHooks(
    // Lets pretend this function can throw and takes time to execute.
    async (a: number, b: number): Promise<number> => {
        const shouldThrow1 = Math.round(Math.random() * 100);
        if (shouldThrow1 > 50) {
            throw new Error("Unexpected error occured");
        }
        await LazyPromise.delay(
            TimeSpan.fromMilliseconds(Math.random() * 1000),
        );
        const shouldThrow2 = Math.round(Math.random() * 100);
        if (shouldThrow2 > 50) {
            throw new Error("Unexpected error occured");
        }
        return a / b;
    },
    observe({
        onStart: (data) => {
            console.log("START:", data);
        },
        onSuccess: (data) => {
            console.log("SUCCESS:", data);
        },
        onError: (data) => {
            console.error("ERROR:", data);
        },
        onFinally: (data) => {
            console.log("FINALLY:", data);
        },
    }),
).invoke(20, 10);
// Will log when the function execution has started.
// Will log if the function succeded.
// Will log if the function errored and the error.
// Will log the execution time

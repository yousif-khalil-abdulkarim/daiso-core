import { describe, test, expect } from "vitest";
import { LazyPromise } from "@/async/utilities/lazy-promise/lazy-promise.js";

describe("class: LazyPromise", () => {
    describe("method: defer", () => {
        test("Should execute the given async function when defer method is called", () => {
            let hasExecuted = false;
            // eslint-disable-next-line @typescript-eslint/require-await
            const promise = new LazyPromise(async () => {
                hasExecuted = true;
            });
            expect(hasExecuted).toBe(false);
            promise.defer();
            expect(hasExecuted).toBe(true);
        });
    });
    describe("method: then", () => {
        test("Should execute the given async function when awaited", async () => {
            let hasExecuted = false;
            // eslint-disable-next-line @typescript-eslint/require-await
            const promise = new LazyPromise(async () => {
                hasExecuted = true;
            });
            expect(hasExecuted).toBe(false);
            await promise;
            expect(hasExecuted).toBe(true);
        });
        test("Should execute the given async function when then method is called", () => {
            let hasExecuted = false;
            // eslint-disable-next-line @typescript-eslint/require-await
            const promise = new LazyPromise(async () => {
                hasExecuted = true;
            });
            expect(hasExecuted).toBe(false);
            promise.then();
            expect(hasExecuted).toBe(true);
        });
    });
});

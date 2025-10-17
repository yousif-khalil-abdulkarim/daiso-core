import { describe, test, expect } from "vitest";
import { LazyPromise } from "@/resilience/utilities/lazy-promise/lazy-promise.js";

describe("class: LazyPromise", () => {
    describe("static method: wrapFn", () => {
        test("Should work exactly like the given function", async () => {
            // eslint-disable-next-line @typescript-eslint/require-await
            async function add(a: number, b: number) {
                return a + b;
            }
            const wrappedTestFn = LazyPromise.wrapFn(add);
            expect(await wrappedTestFn(1, 1)).toBe(2);
        });
        test("Should return instance of LazyPromise", () => {
            // eslint-disable-next-line @typescript-eslint/require-await
            async function add(a: number, b: number) {
                return a + b;
            }
            const wrappedTestFn = LazyPromise.wrapFn(add);
            expect(wrappedTestFn(1, 1)).toBeInstanceOf(LazyPromise);
        });
    });
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

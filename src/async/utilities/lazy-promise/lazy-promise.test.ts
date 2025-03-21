import { TimeSpan } from "@/utilities/_module-exports.js";
import { describe, test, expect } from "vitest";
import { LazyPromise } from "@/async/utilities/lazy-promise/lazy-promise.js";
import {
    AbortAsyncError,
    AsyncError,
    RetryAsyncError,
    TimeoutAsyncError,
} from "@/async/async.errors.js";

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
    describe("static method: delay", () => {
        test("should throw AsyncError when aborted", async () => {
            const abortController = new AbortController();
            const outputPromise = LazyPromise.delay(
                TimeSpan.fromMilliseconds(50),
            ).setAbortSignal(abortController.signal);
            setTimeout(() => {
                abortController.abort();
            }, 25);
            await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
        });
        test("should throw AbortAsyncError when aborted", async () => {
            const abortController = new AbortController();
            const outputPromise = LazyPromise.delay(
                TimeSpan.fromMilliseconds(50),
            ).setAbortSignal(abortController.signal);
            setTimeout(() => {
                abortController.abort();
            }, 25);
            await expect(outputPromise).rejects.toBeInstanceOf(AbortAsyncError);
        });
        test("should return value when not aborted", async () => {
            const abortController = new AbortController();
            const outputPromise = LazyPromise.delay(
                TimeSpan.fromMilliseconds(50),
            ).setAbortSignal(abortController.signal);
            await expect(outputPromise).resolves.toBeUndefined();
        });
    });
    describe("method: setRetryPolicy / setBackoffPolicy / setRetryAttempts", () => {
        test("Should throw RetryAsyncError when all atempts fail", async () => {
            const promise = new LazyPromise(
                // eslint-disable-next-line @typescript-eslint/require-await
                async () => {
                    throw new Error("My own error");
                },
            )
                .setRetryAttempts(4)
                .setBackoffPolicy(() => 0);
            await expect(promise).rejects.toBeInstanceOf(RetryAsyncError);
        });
        test("Should retry until given maxAtempt", async () => {
            let repetition = 0;
            const maxAttempts = 0;
            try {
                await new LazyPromise(
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async () => {
                        repetition++;
                        throw new Error("My own error");
                    },
                )
                    .setRetryAttempts(0)
                    .setBackoffPolicy(() => 0);
            } catch {
                /* Empty */
            }
            expect(repetition).toBe(maxAttempts);
        });
        test("Should retry only specific error when given custom retry policy", async () => {
            class ErrorA extends Error {}
            class ErrorB extends Error {}
            const promise = new LazyPromise(
                // eslint-disable-next-line @typescript-eslint/require-await
                async () => {
                    throw new ErrorB("My own error");
                },
            )
                .setRetryAttempts(4)
                .setBackoffPolicy(() => 0)
                .setRetryPolicy((error) => error instanceof ErrorA);
            await expect(promise).rejects.toBeInstanceOf(ErrorB);
        });
        test("Should not retry when given custom retry policy and unknown error", async () => {
            class ErrorA extends Error {}
            const promise = new LazyPromise(
                // eslint-disable-next-line @typescript-eslint/require-await
                async () => {
                    throw new ErrorA("My own error");
                },
            )
                .setRetryAttempts(4)
                .setBackoffPolicy(() => 0)
                .setRetryPolicy((error) => error instanceof ErrorA);
            await expect(promise).rejects.toBeInstanceOf(RetryAsyncError);
        });
        test("Should return value", async () => {
            let repetition = 0;
            const maxAttempts = 4;
            const promise = new LazyPromise(
                // eslint-disable-next-line @typescript-eslint/require-await
                async () => {
                    repetition++;
                    if (repetition < maxAttempts) {
                        throw new Error("My own error");
                    }
                    return "text";
                },
            )
                .setRetryAttempts(maxAttempts)
                .setBackoffPolicy(() => 0);
            await expect(promise).resolves.toBe("text");
        });
    });
    describe("method: setRetryTimeout", () => {
        test("should throw AsyncError when timed out", async () => {
            const outputPromise = new LazyPromise(async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                throw new Error("Unexpected error");
            })
                .setRetryAttempts(2)
                .setBackoffPolicy(() => 15)
                .setRetryTimeout(TimeSpan.fromMilliseconds(25));
            await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
        });
        test("should throw RetryAsyncError when timed out", async () => {
            const outputPromise = new LazyPromise(async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                throw new Error("Unexpected error");
            })
                .setRetryAttempts(2)
                .setBackoffPolicy(() => 15)
                .setRetryTimeout(TimeSpan.fromMilliseconds(25));
            await expect(outputPromise).rejects.toBeInstanceOf(RetryAsyncError);
        });
        test("should return value when not timed out", async () => {
            const outputPromise = new LazyPromise(async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(50));
                return "a";
            })
                .setRetryAttempts(2)
                .setBackoffPolicy(() => 0)
                .setRetryTimeout(TimeSpan.fromMilliseconds(100));
            await expect(outputPromise).resolves.toBe("a");
        });
    });
    describe("method: setTotalTimeout", () => {
        test("should throw AsyncError when timed out", async () => {
            const outputPromise = new LazyPromise(
                LazyPromise.delay(TimeSpan.fromMilliseconds(50)),
            ).setTotalTimeout(TimeSpan.fromMilliseconds(25));
            await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
        });
        test("should throw TimeoutAsyncError when timed out", async () => {
            const outputPromise = new LazyPromise(
                LazyPromise.delay(TimeSpan.fromMilliseconds(50)),
            ).setTotalTimeout(TimeSpan.fromMilliseconds(25));
            await expect(outputPromise).rejects.toBeInstanceOf(
                TimeoutAsyncError,
            );
        });
        test("should return value when not timed out", async () => {
            const outputPromise = new LazyPromise(async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(50));
                return "a";
            }).setTotalTimeout(TimeSpan.fromMilliseconds(100));
            await expect(outputPromise).resolves.toBe("a");
        });
        test("Should forward error", async () => {
            class ErrorA extends Error {}
            // eslint-disable-next-line @typescript-eslint/require-await
            const promise = new LazyPromise(async () => {
                throw new ErrorA();
            }).setTotalTimeout(TimeSpan.fromSeconds(2));
            await expect(promise).rejects.toBeInstanceOf(ErrorA);
        });
    });
    describe("method: setAbortSignal", () => {
        test("should throw AsyncError when aborted", async () => {
            const abortController = new AbortController();
            setTimeout(() => {
                abortController.abort();
            }, 25);
            const outputPromise = new LazyPromise(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolve("a");
                        }, 50);
                    }),
            ).setAbortSignal(abortController.signal);
            await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
        });
        test("should throw AbortAsyncError when aborted", async () => {
            const inputPromise = new Promise((resolve) => {
                setTimeout(() => {
                    resolve("a");
                }, 50);
            });
            const abortController = new AbortController();
            setTimeout(() => {
                abortController.abort();
            }, 25);
            const outputPromise = new LazyPromise(
                () => inputPromise,
            ).setAbortSignal(abortController.signal);
            await expect(outputPromise).rejects.toBeInstanceOf(AbortAsyncError);
        });
        test("should return value when not aborted", async () => {
            const inputPromise = new Promise((resolve) => {
                setTimeout(() => {
                    resolve("a");
                }, 50);
            });
            const abortController = new AbortController();
            const outputPromise = new LazyPromise(
                () => inputPromise,
            ).setAbortSignal(abortController.signal);
            await expect(outputPromise).resolves.toBe("a");
        });
        test("Should forward error", async () => {
            class ErrorA extends Error {}
            const abortController = new AbortController();
            // eslint-disable-next-line @typescript-eslint/require-await
            const promise = new LazyPromise(async () => {
                throw new ErrorA();
            }).setAbortSignal(abortController.signal);
            await expect(promise).rejects.toBeInstanceOf(ErrorA);
        });
    });
    describe("method: defer", () => {
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

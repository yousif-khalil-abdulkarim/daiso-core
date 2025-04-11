import { AsyncHooks, TimeSpan } from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import { concurrentHedging } from "@/async/middlewares/hedging/concurrent-hedging/concurrent-hedging.middleware.js";
import { HedgingAsyncError } from "@/async/async.errors.js";
import { LazyPromise } from "@/async/utilities/_module.js";

describe("function: concurrentHedging", () => {
    test("Should throw HedgingAsyncError when initial function and all fallbacks fail", async () => {
        const promise = new AsyncHooks(
            async (_url: string): Promise<unknown> => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                throw new Error();
            },
            [
                concurrentHedging({
                    fallbacks: [
                        async (_url: string): Promise<unknown> => {
                            await LazyPromise.delay(
                                TimeSpan.fromMilliseconds(20),
                            );
                            throw new Error();
                        },
                    ],
                }),
            ],
        ).invoke("URL");

        await expect(promise).rejects.toBeInstanceOf(HedgingAsyncError);
    });
    test("Should return value when initial function succedes", async () => {
        const value = await new AsyncHooks(
            async (_url: string): Promise<unknown> => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                return "data";
            },
            [
                concurrentHedging({
                    fallbacks: [
                        async (_url: string): Promise<unknown> => {
                            await LazyPromise.delay(
                                TimeSpan.fromMilliseconds(20),
                            );
                            throw new Error();
                        },
                    ],
                }),
            ],
        ).invoke("URL");

        expect(value).toBe("data");
    });
    test("Should return value when first fallback succedes", async () => {
        const value = await new AsyncHooks(
            async (_url: string): Promise<unknown> => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                throw new Error();
            },
            [
                concurrentHedging({
                    fallbacks: [
                        async (_url: string): Promise<unknown> => {
                            await LazyPromise.delay(
                                TimeSpan.fromMilliseconds(30),
                            );
                            return "data";
                        },
                        async (_url: string): Promise<unknown> => {
                            await LazyPromise.delay(
                                TimeSpan.fromMilliseconds(20),
                            );
                            throw new Error();
                        },
                    ],
                }),
            ],
        ).invoke("URL");

        expect(value).toBe("data");
    });
    test("Should return value when second fallback succedes", async () => {
        const value = await new AsyncHooks(
            async (_url: string): Promise<unknown> => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                throw new Error();
            },
            [
                concurrentHedging({
                    fallbacks: [
                        async (_url: string): Promise<unknown> => {
                            await LazyPromise.delay(
                                TimeSpan.fromMilliseconds(20),
                            );
                            throw new Error();
                        },
                        async (_url: string): Promise<unknown> => {
                            await LazyPromise.delay(
                                TimeSpan.fromMilliseconds(30),
                            );
                            return "data";
                        },
                    ],
                }),
            ],
        ).invoke("URL");

        expect(value).toBe("data");
    });
    test("Should abort fallbacks when function succedes", async () => {
        let fn = 0;
        function createFunc(timeSpan: TimeSpan) {
            return async (
                _url: string,
                signal?: AbortSignal,
            ): Promise<unknown> => {
                const value = await Promise.race([
                    new Promise<unknown>((_, rejected) => {
                        signal?.addEventListener("abort", () => {
                            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                            rejected(signal.reason);
                        });
                    }),
                    LazyPromise.delay(timeSpan).then(() => "data"),
                ]);
                fn++;
                return value;
            };
        }
        await new AsyncHooks(
            createFunc(TimeSpan.fromMilliseconds(10)),
            [
                concurrentHedging({
                    fallbacks: [
                        createFunc(TimeSpan.fromMilliseconds(20)),
                        createFunc(TimeSpan.fromMilliseconds(30)),
                    ],
                }),
            ],
            {
                signalBinder: {
                    getSignal: (args) => args[1],
                    forwardSignal: (args, signal) => {
                        args[1] = signal;
                    },
                },
            },
        ).invoke("URL");
        await LazyPromise.delay(TimeSpan.fromMilliseconds(40));

        expect(fn).toBe(1);
    });
    test("Should abort function and second fallback when first fallback succedes", async () => {
        let fn = 0;
        function createFunc(timeSpan: TimeSpan) {
            return async (
                _url: string,
                signal?: AbortSignal,
            ): Promise<unknown> => {
                const value = await Promise.race([
                    new Promise<unknown>((_, rejected) => {
                        signal?.addEventListener("abort", () => {
                            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                            rejected(signal.reason);
                        });
                    }),
                    LazyPromise.delay(timeSpan).then(() => "data"),
                ]);
                fn++;
                return value;
            };
        }
        await new AsyncHooks(
            createFunc(TimeSpan.fromMilliseconds(20)),
            [
                concurrentHedging({
                    fallbacks: [
                        createFunc(TimeSpan.fromMilliseconds(10)),
                        createFunc(TimeSpan.fromMilliseconds(30)),
                    ],
                }),
            ],
            {
                signalBinder: {
                    getSignal: (args) => args[1],
                    forwardSignal: (args, signal) => {
                        args[1] = signal;
                    },
                },
            },
        ).invoke("URL");
        await LazyPromise.delay(TimeSpan.fromMilliseconds(40));

        expect(fn).toBe(1);
    });
});

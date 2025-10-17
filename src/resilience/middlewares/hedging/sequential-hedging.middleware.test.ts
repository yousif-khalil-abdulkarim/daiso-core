import { LazyPromise } from "@/resilience/utilities/_module.js";
import {
    resultFailure,
    type Result,
    resultSuccess,
} from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";
import { sequentialHedging } from "@/resilience/middlewares/hedging/sequential-hedging.middleware.js";
import { z } from "zod";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import { AsyncHooks } from "@/hooks/_module-exports.js";

function createDelayedFn<TParameters extends unknown[], TReturn>(
    time: TimeSpan,
    fn: (...args: [...TParameters, sigal?: AbortSignal]) => TReturn,
) {
    return async (
        ...args: [...TParameters, sigal?: AbortSignal]
    ): Promise<TReturn> => {
        const start = performance.now();

        const abortSignal = args.find((arg) => arg instanceof AbortSignal);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
        while (true) {
            if (abortSignal?.aborted !== undefined && abortSignal.aborted) {
                throw abortSignal.reason;
            }
            const end = performance.now();
            await LazyPromise.delay(TimeSpan.fromMilliseconds(1));

            const time_ = end - start;

            if (time_ >= time.toMilliseconds()) {
                break;
            }
        }
        return fn(...args);
    };
}

describe("function: sequentialHedging", () => {
    describe("With result:", () => {
        test("Should return failed Result when initial function and all fallbacks fail", async () => {
            const promise = new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        return resultFailure(new Error());
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    return resultFailure(new Error());
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            await expect(promise).rejects.toBeInstanceOf(Error);
        });
        test("Should return value when initial function succedes", async () => {
            const value = await new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        return resultSuccess("data");
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    return resultFailure(new Error());
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            expect(value).toEqual(resultSuccess("data"));
        });
        test("Should return value when first fallback succedes", async () => {
            const value = await new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        return resultFailure(new Error());
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    return resultSuccess("data");
                                },
                            ),
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    return resultFailure(new Error());
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            expect(value).toEqual(resultSuccess("data"));
        });
        test("Should return value when second fallback succedes", async () => {
            const value = await new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        return resultFailure(new Error());
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    return resultFailure(new Error());
                                },
                            ),
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    return resultSuccess("data");
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            expect(value).toEqual(resultSuccess("data"));
        });
        test("Should abort fallbacks when original function return first", async () => {
            let i = 0;
            await new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        return resultSuccess("data");
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    return resultSuccess("data");
                                },
                            ),
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    i++;
                                    return resultSuccess("data");
                                },
                            ),
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
            await LazyPromise.delay(TimeSpan.fromMilliseconds(60));

            expect(i).toBe(1);
        });
        test("Should abort fallbacks when first fallback return first", async () => {
            let i = 0;
            await new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(20),
                    () => {
                        i++;
                        return resultSuccess("data");
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(10),
                                () => {
                                    i++;
                                    return resultSuccess("data");
                                },
                            ),
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    i++;
                                    return resultSuccess("data");
                                },
                            ),
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
            await LazyPromise.delay(TimeSpan.fromMilliseconds(60));

            expect(i).toBe(1);
        });
        test("Should not apply hedging when given predicate ErrorPolicy and unknown error", async () => {
            class ErrorB extends Error {}
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        return resultFailure(new ErrorB());
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: (error) => error instanceof ErrorA,
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    return resultFailure(new Error());
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(1);
        });
        test("Should apply hedging specific error when given predicate ErrorPolicy", async () => {
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        return resultFailure(new ErrorA());
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: (error) => error instanceof ErrorA,
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    return resultFailure(new Error());
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(2);
        });
        test("Should apply hedging specific error when given standard schema ErrorPolicy", async () => {
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        return resultFailure(new ErrorA());
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: z.instanceof(ErrorA),
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    return resultFailure(new Error());
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(2);
        });
        test("Should apply hedging specific error when given class ErrorPolicy", async () => {
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], Result<string, Error>>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        return resultFailure(new ErrorA());
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: ErrorA,
                        fallbacks: [
                            createDelayedFn(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    return resultFailure(new Error());
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(2);
        });
    });
    describe("With throw error:", () => {
        test("Should throw Error when initial function and all fallbacks fail", async () => {
            const promise = new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        throw new Error();
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    throw new Error();
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            await expect(promise).rejects.toBeInstanceOf(Error);
        });
        test("Should return value when initial function succedes", async () => {
            const value = await new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        return "data";
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    throw new Error();
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            expect(value).toBe("data");
        });
        test("Should return value when first fallback succedes", async () => {
            const value = await new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        throw new Error();
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    return "data";
                                },
                            ),
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    throw new Error();
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            expect(value).toBe("data");
        });
        test("Should return value when second fallback succedes", async () => {
            const value = await new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        throw new Error();
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    throw new Error();
                                },
                            ),
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    return "data";
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            expect(value).toBe("data");
        });
        test("Should abort fallbacks when original function return first", async () => {
            let i = 0;
            await new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        return "data";
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    return "data";
                                },
                            ),
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    i++;
                                    return "data";
                                },
                            ),
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
            await LazyPromise.delay(TimeSpan.fromMilliseconds(60));

            expect(i).toBe(1);
        });
        test("Should abort fallbacks when first fallback return first", async () => {
            let i = 0;
            await new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(20),
                    () => {
                        i++;
                        return "data";
                    },
                ),
                [
                    sequentialHedging({
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(10),
                                () => {
                                    i++;
                                    return "data";
                                },
                            ),
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(30),
                                () => {
                                    i++;
                                    return "data";
                                },
                            ),
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
            await LazyPromise.delay(TimeSpan.fromMilliseconds(60));

            expect(i).toBe(1);
        });
        test("Should not apply hedging when given predicate ErrorPolicy and unknown error", async () => {
            class ErrorB extends Error {}
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        throw new ErrorB();
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: (error) => error instanceof ErrorA,
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    throw new Error();
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(1);
        });
        test("Should apply hedging specific error when given predicate ErrorPolicy", async () => {
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        throw new ErrorA();
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: (error) => error instanceof ErrorA,
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    throw new Error();
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(2);
        });
        test("Should apply hedging specific error when given standard schema ErrorPolicy", async () => {
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        throw new ErrorA();
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: z.instanceof(ErrorA),
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    throw new Error();
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(2);
        });
        test("Should apply hedging specific error when given class ErrorPolicy", async () => {
            class ErrorA extends Error {}
            let i = 0;

            const promise = new AsyncHooks(
                createDelayedFn<[string], string>(
                    TimeSpan.fromMilliseconds(10),
                    () => {
                        i++;
                        throw new ErrorA();
                    },
                ),
                [
                    sequentialHedging({
                        errorPolicy: ErrorA,
                        fallbacks: [
                            createDelayedFn<[string], string>(
                                TimeSpan.fromMilliseconds(20),
                                () => {
                                    i++;
                                    throw new Error();
                                },
                            ),
                        ],
                    }),
                ],
            ).invoke("URL");

            try {
                await promise;
            } catch {
                /* EMPTY */
            }

            expect(i).toBe(2);
        });
    });
});

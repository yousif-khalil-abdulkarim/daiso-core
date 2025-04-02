import { describe, expect, test } from "vitest";
import {
    timeout,
    type OnTimeoutData,
} from "@/async/middlewares/timeout/timeout.middleware.js";
import { AsyncError, TimeoutAsyncError } from "@/async/async.errors.js";
import { AsyncHooks, TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/utilities/_module.js";

describe("function: timeout", () => {
    test("should throw AsyncError when timed out", async () => {
        const outputPromise = new AsyncHooks(
            async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(50));
                return "a";
            },
            timeout({ time: TimeSpan.fromMilliseconds(25) }),
        ).invoke();

        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw TimeoutAsyncError when timed out", async () => {
        const outputPromise = new AsyncHooks(
            async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(100));
                return "a";
            },
            timeout({ time: TimeSpan.fromMilliseconds(25) }),
        ).invoke();

        await expect(outputPromise).rejects.toBeInstanceOf(TimeoutAsyncError);
    });
    test("should return value when not timed out", async () => {
        const outputPromise = new AsyncHooks(
            async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(50));
                return "a";
            },
            timeout({ time: TimeSpan.fromMilliseconds(100) }),
        ).invoke();

        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}

        const promise = new AsyncHooks(
            () => Promise.reject(new ErrorA()),
            timeout({ time: TimeSpan.fromSeconds(2) }),
        ).invoke();
        await expect(promise).rejects.toBeInstanceOf(ErrorA);
    });
    test("Should call onTimeout callback when timedout", async () => {
        let data = null as OnTimeoutData | null;
        const time = TimeSpan.fromMilliseconds(25);
        const outputPromise = new AsyncHooks(
            async (_url: string) => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(100));
                return "a";
            },
            timeout({
                time,
                onTimeout(data_) {
                    data = data_;
                },
            }),
            {
                name: "fetchData",
            },
        ).invoke("ENDPOINT");

        try {
            await outputPromise;
        } catch {
            /* Empty */
        }

        expect(data?.maxTime).toBeInstanceOf(TimeSpan);
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
    });
    test("Should not call onTimeout callback when not timedout", async () => {
        let data = null as OnTimeoutData | null;
        const time = TimeSpan.fromMilliseconds(25);
        const outputPromise = new AsyncHooks(
            (_url: string) => {
                return "a";
            },
            timeout({
                time,
                onTimeout(data_) {
                    data = data_;
                },
            }),
            {
                name: "fetchData",
            },
        ).invoke("ENDPOINT");

        try {
            await outputPromise;
        } catch {
            /* Empty */
        }

        expect(data).toBeNull();
    });
    test("Should forward timeout AbortSignal when optional", async () => {
        let hasAborted = false;
        const outputPromise = new AsyncHooks(
            async (signal?: AbortSignal) => {
                signal?.addEventListener("abort", () => {
                    hasAborted = true;
                });
                await LazyPromise.delay(TimeSpan.fromMilliseconds(100));
                return "a";
            },
            timeout({
                time: TimeSpan.fromMilliseconds(25),
                signalBinder: ([fnSignal], timeoutSignal) => {
                    return [
                        AbortSignal.any(
                            [fnSignal, timeoutSignal].filter(
                                (abortSignal) => abortSignal !== undefined,
                            ),
                        ),
                    ] as const;
                },
            }),
        ).invoke();

        try {
            await outputPromise;
        } catch {
            /* Empty */
        }

        expect(hasAborted).toBe(true);
    });
    test("Should forward timeout AbortSignal when required", async () => {
        let hasAborted = false;
        const abortController = new AbortController();
        const outputPromise = new AsyncHooks(
            async (signal: AbortSignal) => {
                signal.addEventListener("abort", () => {
                    hasAborted = true;
                });
                await LazyPromise.delay(TimeSpan.fromMilliseconds(100));
                return "a";
            },
            timeout({
                time: TimeSpan.fromMilliseconds(25),
                signalBinder: ([fnSignal], timeoutSignal) => {
                    return [
                        AbortSignal.any([fnSignal, timeoutSignal]),
                    ] as const;
                },
            }),
        ).invoke(abortController.signal);

        try {
            await outputPromise;
        } catch {
            /* Empty */
        }

        expect(hasAborted).toBe(true);
    });
});

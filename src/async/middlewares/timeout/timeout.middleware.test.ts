import { describe, expect, test } from "vitest";
import { timeout } from "@/async/middlewares/timeout/timeout.middleware.js";
import { type OnTimeoutData } from "@/async/middlewares/timeout/timeout.type.js";
import { AsyncError, TimeoutAsyncError } from "@/async/async.errors.js";
import { AsyncHooks } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/utilities/lazy-promise/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

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

describe("function: timeout", () => {
    test("should throw AsyncError when timed out", async () => {
        const outputPromise = new AsyncHooks(
            createDelayedFn<[], string>(
                TimeSpan.fromMilliseconds(50),
                () => "a",
            ),
            timeout({ waitTime: TimeSpan.fromMilliseconds(25) }),
        ).invoke();

        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw TimeoutAsyncError when timed out", async () => {
        const outputPromise = new AsyncHooks(
            createDelayedFn<[], string>(
                TimeSpan.fromMilliseconds(100),
                () => "a",
            ),
            timeout({ waitTime: TimeSpan.fromMilliseconds(25) }),
        ).invoke();

        await expect(outputPromise).rejects.toBeInstanceOf(TimeoutAsyncError);
    });
    test("should return value when not timed out", async () => {
        const outputPromise = new AsyncHooks(
            createDelayedFn<[], string>(
                TimeSpan.fromMilliseconds(50),
                () => "a",
            ),
            timeout({ waitTime: TimeSpan.fromMilliseconds(100) }),
        ).invoke();

        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}

        const promise = new AsyncHooks(
            createDelayedFn<[], string>(TimeSpan.fromMilliseconds(50), () => {
                throw new ErrorA();
            }),
            timeout({ waitTime: TimeSpan.fromSeconds(2) }),
        ).invoke();
        await expect(promise).rejects.toBeInstanceOf(ErrorA);
    });
    test("Should call onTimeout callback when timedout", async () => {
        let data = null as OnTimeoutData | null;
        const time = TimeSpan.fromMilliseconds(25);
        const outputPromise = new AsyncHooks(
            createDelayedFn<[string], string>(
                TimeSpan.fromMilliseconds(100),
                () => "a",
            ),
            timeout({
                waitTime: time,
                onTimeout(data_) {
                    data = data_;
                },
            }),
            {
                context: {
                    name: "fetchData",
                },
            },
        ).invoke("ENDPOINT");

        try {
            await outputPromise;
        } catch {
            /* Empty */
        }

        expect(data?.waitTime).toBeInstanceOf(TimeSpan);
        expect(data?.args).toStrictEqual(["ENDPOINT"]);
        expect(data?.context).toStrictEqual({
            name: "fetchData",
        });
    });
    test("Should not call onTimeout callback when not timedout", async () => {
        let data = null as OnTimeoutData | null;
        const time = TimeSpan.fromMilliseconds(25);
        const outputPromise = new AsyncHooks(
            createDelayedFn<[string], string>(
                TimeSpan.fromMilliseconds(0),
                () => "a",
            ),
            timeout({
                waitTime: time,
                onTimeout(data_) {
                    data = data_;
                },
            }),
            {
                context: {
                    name: "fetchData",
                },
            },
        ).invoke("ENDPOINT");

        try {
            await outputPromise;
        } catch {
            /* Empty */
        }

        expect(data).toBeNull();
    });
});

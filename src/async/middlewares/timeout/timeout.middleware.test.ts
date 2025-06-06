import { describe, expect, test } from "vitest";
import {
    timeout,
    type OnTimeoutData,
} from "@/async/middlewares/timeout/timeout.middleware.js";
import { AsyncError, TimeoutAsyncError } from "@/async/async.errors.js";
import { AsyncHooks, TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/utilities/lazy-promise/_module.js";

describe("function: timeout", () => {
    test("should throw AsyncError when timed out", async () => {
        const outputPromise = new AsyncHooks(
            async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(50));
                return "a";
            },
            timeout({ waitTime: TimeSpan.fromMilliseconds(25) }),
        ).invoke();

        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw TimeoutAsyncError when timed out", async () => {
        const outputPromise = new AsyncHooks(
            async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(100));
                return "a";
            },
            timeout({ waitTime: TimeSpan.fromMilliseconds(25) }),
        ).invoke();

        await expect(outputPromise).rejects.toBeInstanceOf(TimeoutAsyncError);
    });
    test("should return value when not timed out", async () => {
        const outputPromise = new AsyncHooks(
            async () => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(50));
                return "a";
            },
            timeout({ waitTime: TimeSpan.fromMilliseconds(100) }),
        ).invoke();

        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}

        const promise = new AsyncHooks(
            () => Promise.reject(new ErrorA()),
            timeout({ waitTime: TimeSpan.fromSeconds(2) }),
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
            (_url: string) => {
                return "a";
            },
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

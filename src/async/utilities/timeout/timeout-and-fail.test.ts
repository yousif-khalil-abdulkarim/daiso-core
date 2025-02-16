import { describe, expect, test } from "vitest";
import { timeoutAndFail } from "@/async/utilities/timeout/timeout-and-fail.js";
import { AsyncError, TimeoutAsyncError } from "@/async/async.errors.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

describe("function: timeoutAndFail", () => {
    test("should throw AsyncError when timed out", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const outputPromise = timeoutAndFail(
            () => inputPromise,
            TimeSpan.fromMilliseconds(25),
        );
        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw TimeoutAsyncError when timed out", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(100).toMilliseconds());
        });
        const outputPromise = timeoutAndFail(
            () => inputPromise,
            TimeSpan.fromMilliseconds(25),
        );
        await expect(outputPromise).rejects.toBeInstanceOf(TimeoutAsyncError);
    });
    test("should return value when not timed out", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const outputPromise = timeoutAndFail(
            () => inputPromise,
            TimeSpan.fromMilliseconds(100),
        );
        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}
        // eslint-disable-next-line @typescript-eslint/require-await
        const promise = timeoutAndFail(async () => {
            throw new ErrorA();
        }, TimeSpan.fromSeconds(2));
        await expect(promise).rejects.toBeInstanceOf(ErrorA);
    });
});

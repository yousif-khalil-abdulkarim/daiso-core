import { describe, expect, test } from "vitest";
import { timeout } from "@/async/utilities/timeout/timeout.js";
import { AsyncError, TimeoutAsyncError } from "@/async/async.errors.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

describe("function: timeout", () => {
    test("should return AsyncError when timed out", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const [value, error] = await timeout(
            () => inputPromise,
            TimeSpan.fromMilliseconds(25),
        );
        expect(value).toBe(null);
        expect(error).toBeInstanceOf(AsyncError);
    });
    test("should return TimeoutAsyncError when timed out", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const [value, error] = await timeout(
            () => inputPromise,
            TimeSpan.fromMilliseconds(25),
        );
        expect(value).toBe(null);
        expect(error).toBeInstanceOf(TimeoutAsyncError);
    });
    test("should return value when not timed out", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const [value, error] = await timeout(
            () => inputPromise,
            TimeSpan.fromMilliseconds(100),
        );
        expect(value).toBe("a");
        expect(error).toBeNull();
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}
        // eslint-disable-next-line @typescript-eslint/require-await
        const promise = timeout(async () => {
            throw new ErrorA();
        }, TimeSpan.fromSeconds(2));
        await expect(promise).rejects.toBeInstanceOf(ErrorA);
    });
});

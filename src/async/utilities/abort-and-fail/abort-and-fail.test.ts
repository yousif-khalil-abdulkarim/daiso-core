import { describe, expect, test } from "vitest";
import { abortAndFail } from "@/async/utilities/abort-and-fail/abort-and-fail.js";
import { AbortAsyncError, AsyncError } from "@/async/async.errors.js";

describe("function: abortAndFail", () => {
    test("should throw AsyncError when aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, 50);
        });
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, 25);
        const outputPromise = abortAndFail(
            inputPromise,
            abortController.signal,
        );
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
        const outputPromise = abortAndFail(
            inputPromise,
            abortController.signal,
        );
        await expect(outputPromise).rejects.toBeInstanceOf(AbortAsyncError);
    });
    test("should return value when not aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, 50);
        });
        const abortController = new AbortController();
        const outputPromise = abortAndFail(
            inputPromise,
            abortController.signal,
        );
        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}
        const abortController = new AbortController();
        // eslint-disable-next-line @typescript-eslint/require-await
        const promise = abortAndFail(
            Promise.reject(new ErrorA()),
            abortController.signal,
        );
        await expect(promise).rejects.toBeInstanceOf(ErrorA);
    });
});

import { describe, expect, test } from "vitest";
import { abort } from "@/async/utilities/abort/abort";
import { AbortAsyncError, AsyncError } from "@/async/async.errors";

describe("function: abort", () => {
    test("should retrun AsyncError when aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, 50);
        });
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, 25);
        const [value, error] = await abort(
            () => inputPromise,
            abortController.signal,
        );
        expect(value).toBeNull();
        expect(error).toBeInstanceOf(AsyncError);
    });
    test("should return AbortAsyncError when aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, 50);
        });
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, 25);
        const [value, error] = await abort(
            () => inputPromise,
            abortController.signal,
        );
        expect(value).toBeNull();
        expect(error).toBeInstanceOf(AbortAsyncError);
    });
    test("should return value when not aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, 50);
        });
        const abortController = new AbortController();
        const [value, error] = await abort(
            () => inputPromise,
            abortController.signal,
        );
        expect(value).toBe("a");
        expect(error).toBeNull();
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}
        const abortController = new AbortController();
        // eslint-disable-next-line @typescript-eslint/require-await
        const promise = abort(async () => {
            throw new ErrorA();
        }, abortController.signal);
        await expect(promise).rejects.toBeInstanceOf(ErrorA);
    });
});

import { describe, expect, test } from "vitest";
import { abortablePromise } from "@/async/abortable/abortable-promise/_module";
import { AbortAsyncError, AsyncError } from "@/async/_shared";

describe("function: abortablePromise", () => {
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
        const outputPromise = abortablePromise(
            () => inputPromise,
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
        const outputPromise = abortablePromise(
            () => inputPromise,
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
        const outputPromise = abortablePromise(
            () => inputPromise,
            abortController.signal,
        );
        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should not execute callback function when not awaited", async () => {
        const abortController = new AbortController();
        let value: string | null = null;
        // eslint-disable-next-line @typescript-eslint/require-await
        abortablePromise(async () => {
            value = "a";
        }, abortController.signal);
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 15);
        });
        expect(value).toBe(null);
    });
    test("Should execute callback function when not awaited", async () => {
        const abortController = new AbortController();
        let value: string | null = null;
        // eslint-disable-next-line @typescript-eslint/require-await
        const promise = abortablePromise(async () => {
            value = "a";
        }, abortController.signal);
        await promise;
        expect(value).toBe("a");
    });
});

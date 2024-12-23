import { describe, expect, test } from "vitest";
import { abortable } from "@/async/abortable/_module";
import { AbortAsyncError, AsyncError } from "@/async/_shared";

describe("function: abortable", () => {
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
        const outputPromise = abortable(
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
        const outputPromise = abortable(
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
        const outputPromise = abortable(
            () => inputPromise,
            abortController.signal,
        );
        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should not execute callback function when not awaited", async () => {
        const abortController = new AbortController();
        let value: string | null = null;
        // eslint-disable-next-line @typescript-eslint/require-await
        abortable(async () => {
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
        const promise = abortable(async () => {
            value = "a";
        }, abortController.signal);
        await promise;
        expect(value).toBe("a");
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}
        const abortController = new AbortController();
        // eslint-disable-next-line @typescript-eslint/require-await
        const promise = abortable(async () => {
            throw new ErrorA();
        }, abortController.signal);
        await expect(promise).rejects.toBeInstanceOf(ErrorA);
    });
});

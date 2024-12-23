import { describe, expect, test } from "vitest";
import { timeout } from "@/async/timeout/_module";
import {
    AbortAsyncError,
    AsyncError,
    TimeoutAsyncError,
} from "@/async/_shared";
import { TimeSpan } from "@/_module";

describe("function: timeout", () => {
    test("should throw AsyncError when aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, TimeSpan.fromMilliseconds(25).toMilliseconds());
        const outputPromise = timeout(
            () => inputPromise,
            TimeSpan.fromMilliseconds(100),
            abortController.signal,
        );
        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw AbortAsyncError when aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, TimeSpan.fromMilliseconds(25).toMilliseconds());
        const outputPromise = timeout(
            () => inputPromise,
            TimeSpan.fromMilliseconds(100),
            abortController.signal,
        );
        await expect(outputPromise).rejects.toBeInstanceOf(AbortAsyncError);
    });
    test("should throw AsyncError when timed out", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const outputPromise = timeout(
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
        const outputPromise = timeout(
            () => inputPromise,
            TimeSpan.fromMilliseconds(25),
        );
        await expect(outputPromise).rejects.toBeInstanceOf(TimeoutAsyncError);
    });
    test("should return value when not aborted", async () => {
        const inputPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("a");
            }, TimeSpan.fromMilliseconds(50).toMilliseconds());
        });
        const abortController = new AbortController();
        const outputPromise = timeout(
            () => inputPromise,
            TimeSpan.fromMilliseconds(100),
            abortController.signal,
        );
        await expect(outputPromise).resolves.toBe("a");
    });
    test("Should not execute callback function when not awaited", async () => {
        const abortController = new AbortController();
        let value: string | null = null;
        timeout(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                value = "a";
            },
            TimeSpan.fromMilliseconds(100),
            abortController.signal,
        );
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, TimeSpan.fromMilliseconds(15).toMilliseconds());
        });
        expect(value).toBe(null);
    });
    test("Should execute callback function when not awaited", async () => {
        const abortController = new AbortController();
        let value: string | null = null;
        const promise = timeout(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                value = "a";
            },
            TimeSpan.fromMilliseconds(100),
            abortController.signal,
        );
        await promise;
        expect(value).toBe("a");
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

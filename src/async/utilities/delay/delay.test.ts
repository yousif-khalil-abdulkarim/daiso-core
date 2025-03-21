import { describe, expect, test } from "vitest";
import { delay } from "@/async/utilities/_module.js";
import { AbortAsyncError, AsyncError } from "@/async/async.errors.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

describe("function: delay", () => {
    test("should throw AsyncError when aborted", async () => {
        const abortController = new AbortController();
        const outputPromise = delay(
            TimeSpan.fromMilliseconds(50),
            abortController.signal,
        );
        setTimeout(() => {
            abortController.abort();
        }, 25);
        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw AbortAsyncError when aborted", async () => {
        const abortController = new AbortController();
        const outputPromise = delay(
            TimeSpan.fromMilliseconds(50),
            abortController.signal,
        );
        setTimeout(() => {
            abortController.abort();
        }, 25);
        await expect(outputPromise).rejects.toBeInstanceOf(AbortAsyncError);
    });
    test("should return value when not aborted", async () => {
        const abortController = new AbortController();
        const outputPromise = delay(
            TimeSpan.fromMilliseconds(50),
            abortController.signal,
        );
        await expect(outputPromise).resolves.toBeUndefined();
    });
});

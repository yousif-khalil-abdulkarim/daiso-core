import { describe, expect, test } from "vitest";
import { delayPromise } from "@/async/delay/delay-promise/_module";
import { AbortAsyncError, AsyncError } from "@/async/_shared";

describe("function: delayPromise", () => {
    test("should throw AsyncError when aborted", async () => {
        const abortController = new AbortController();
        const outputPromise = delayPromise(50, abortController.signal);
        setTimeout(() => {
            abortController.abort();
        }, 25);
        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw AbortAsyncError when aborted", async () => {
        const abortController = new AbortController();
        const outputPromise = delayPromise(50, abortController.signal);
        setTimeout(() => {
            abortController.abort();
        }, 25);
        await expect(outputPromise).rejects.toBeInstanceOf(AbortAsyncError);
    });
    test("should return value when not aborted", async () => {
        const abortController = new AbortController();
        const outputPromise = delayPromise(50, abortController.signal);
        await expect(outputPromise).resolves.toBeUndefined();
    });
});

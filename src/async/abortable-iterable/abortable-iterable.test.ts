import { describe, expect, test } from "vitest";
import { AsyncError, AbortAsyncError } from "@/async/_shared";
import { abortableIterable } from "@/async/abortable-iterable/_module";

describe("function: abortableIterable", () => {
    test("should throw AsyncError when aborted", async () => {
        const inputIterable: AsyncIterable<string> = {
            async *[Symbol.asyncIterator]() {
                yield "a";
                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 25);
                });
                yield "b";
                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 25);
                });
                yield "c";
            },
        };
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, 25);
        const outputIterable = abortableIterable(
            inputIterable,
            abortController.signal,
        );
        const outputPromise: Promise<string[]> = (async () => {
            const items: string[] = [];
            for await (const item of outputIterable) {
                items.push(item);
            }
            return items;
        })();
        await expect(outputPromise).rejects.toBeInstanceOf(AsyncError);
    });
    test("should throw AbortAsyncError when aborted", async () => {
        const inputIterable: AsyncIterable<string> = {
            async *[Symbol.asyncIterator]() {
                yield "a";
                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 25);
                });
                yield "b";
                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 25);
                });
                yield "c";
            },
        };
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, 25);
        const outputIterable = abortableIterable(
            inputIterable,
            abortController.signal,
        );
        const outputPromise: Promise<string[]> = (async () => {
            const items: string[] = [];
            for await (const item of outputIterable) {
                items.push(item);
            }
            return items;
        })();
        await expect(outputPromise).rejects.toBeInstanceOf(AbortAsyncError);
    });
    test("should return value when not aborted", async () => {
        const inputIterable: AsyncIterable<string> = {
            async *[Symbol.asyncIterator]() {
                yield "a";
                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 25);
                });
                yield "b";
                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 25);
                });
                yield "c";
            },
        };
        const abortController = new AbortController();
        const outputIterable = abortableIterable(
            inputIterable,
            abortController.signal,
        );
        const outputPromise: Promise<string[]> = (async () => {
            const items: string[] = [];
            for await (const item of outputIterable) {
                items.push(item);
            }
            return items;
        })();
        await expect(outputPromise).resolves.toEqual(["a", "b", "c"]);
    });
    test("Should forward error", async () => {
        class ErrorA extends Error {}
        const inputIterable: AsyncIterable<string> = {
            // eslint-disable-next-line @typescript-eslint/require-await
            async *[Symbol.asyncIterator]() {
                yield "a";
                throw new ErrorA();
            },
        };
        const abortController = new AbortController();
        const outputIterable = abortableIterable(
            inputIterable,
            abortController.signal,
        );
        const outputPromise: Promise<string[]> = (async () => {
            const items: string[] = [];
            for await (const item of outputIterable) {
                items.push(item);
            }
            return items;
        })();
        await expect(outputPromise).rejects.toBeInstanceOf(ErrorA);
    });
});

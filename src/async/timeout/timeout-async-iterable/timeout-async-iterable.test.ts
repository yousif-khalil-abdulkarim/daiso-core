import { describe, expect, test } from "vitest";
import { timeoutAsyncIterable } from "@/async/timeout/timeout-async-iterable/_module";
import { AsyncError, AbortAsyncError } from "@/async/_shared";

describe("function: timeoutAsyncIterable", () => {
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
        const outputIterable = timeoutAsyncIterable(
            inputIterable,
            100,
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
        const outputIterable = timeoutAsyncIterable(
            inputIterable,
            100,
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
    test("should throw AsyncError when timed out", async () => {
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
        const outputIterable = timeoutAsyncIterable(
            inputIterable,
            25,
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
    test("should throw AbortAsyncError when timed out", async () => {
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
        const outputIterable = timeoutAsyncIterable(
            inputIterable,
            25,
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
        const outputIterable = timeoutAsyncIterable(
            inputIterable,
            100,
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
});

import { describe, expect, test } from "vitest";
import { delayIterable } from "@/utilities/async-iterable/delay-iterable/_module";
import { AbortAsyncError, AsyncError } from "@/utilities/async/_shared";
import { TimeSpan } from "@/utilities/time-span/_module";

describe("function: delayIterable", () => {
    test("should throw AsyncError when aborted", async () => {
        const inputIterable: AsyncIterable<string> = {
            // eslint-disable-next-line @typescript-eslint/require-await
            async *[Symbol.asyncIterator]() {
                yield "a";
                yield "b";
                yield "c";
            },
        };
        const abortController = new AbortController();
        const outputIterable = delayIterable(
            inputIterable,
            TimeSpan.fromMilliseconds(50),
            abortController.signal,
        );
        setTimeout(() => {
            abortController.abort();
        }, 25);
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
            // eslint-disable-next-line @typescript-eslint/require-await
            async *[Symbol.asyncIterator]() {
                yield "a";
                yield "b";
                yield "c";
            },
        };
        const abortController = new AbortController();
        const outputIterable = delayIterable(
            inputIterable,
            TimeSpan.fromMilliseconds(50),
            abortController.signal,
        );
        setTimeout(() => {
            abortController.abort();
        }, 25);
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
            // eslint-disable-next-line @typescript-eslint/require-await
            async *[Symbol.asyncIterator]() {
                yield "a";
                yield "b";
                yield "c";
            },
        };
        const abortController = new AbortController();
        const outputIterable = delayIterable(
            inputIterable,
            TimeSpan.fromMilliseconds(50),
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

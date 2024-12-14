/**
 * @module Async
 */

import { AbortAsyncError } from "@/async/_shared";
import { abortablePromise } from "@/async/abortable/_module";
import { delayPromise } from "@/async/delay/delay-promise/delay-promise";

/**
 * @internal
 */
class DelayAsyncIterable<TValue> implements AsyncIterable<TValue> {
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly timeInMs: number,
        private readonly abortSignal: AbortSignal,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            if (this.abortSignal.aborted) {
                throw new AbortAsyncError(
                    `Promise was aborted with reason of "${String(this.abortSignal.aborted)}"`,
                    this.abortSignal.reason,
                );
            }
            await delayPromise(this.timeInMs, this.abortSignal);
            const result = await abortablePromise(
                () => iterator.next(),
                this.abortSignal,
            );
            if (result.done) {
                return;
            }
            yield result.value;
        }
    }
}

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function delayAsyncIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    timeInMs: number,
    abortSignal: AbortSignal = new AbortController().signal,
): AsyncIterable<TValue> {
    return new DelayAsyncIterable(iterable, timeInMs, abortSignal);
}

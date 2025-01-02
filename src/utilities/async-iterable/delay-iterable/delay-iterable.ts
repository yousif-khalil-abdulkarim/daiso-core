/**
 * @module Async
 */

import type { TimeSpan } from "@/utilities/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AsyncError } from "@/utilities/async/_shared";
import { AbortAsyncError } from "@/utilities/async/_shared";
import { abortable } from "@/utilities/async/abortable/_module";
import { delay } from "@/utilities/async/delay/delay";

/**
 * @internal
 */
class DelayIterable<TValue> implements AsyncIterable<TValue> {
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly time: TimeSpan,
        private readonly abortSignal: AbortSignal,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        let result = await abortable(() => iterator.next(), this.abortSignal);
        yield result.value;

        while (!result.done) {
            if (this.abortSignal.aborted) {
                throw new AbortAsyncError(
                    `Promise was aborted with reason of "${String(this.abortSignal.aborted)}"`,
                    this.abortSignal.reason,
                );
            }
            await delay(this.time, this.abortSignal);
            result = await abortable(() => iterator.next(), this.abortSignal);
            if (result.done) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return result.value;
            }
            yield result.value;
        }
    }
}

/**
 * The <i>delayIterable</i> function adds delay to each iteration of <i>{@link AsyncIterable}</i> and the delay can be aborted by providing <i>abortSignal</i>.
 * @group AsyncIterable utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @example
 * ```ts
 * import { delayIterable, TimeSpan } from "@daiso-tech/core";
 *
 * const iterable: AsyncIterable<void> = {
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *     yield 2;
 *     yield 3;
 *     yield 4;
 *     yield 5;
 *   }
 * }
 *
 * (async () => {
 *   for await (const item of delayIterable(iterable, TimeSpan.fromSeconds(1))) {
 *     console.log(item);
 *   }
 * })();
 * ```
 * @example with abortSignal
 * ```ts
 * import { delayIterable, TimeSpan } from "@daiso-tech/core";
 *
 * const abortController = new AbortController();
 * setTimeout(() => {
 *  abortController.abort("My abort error");
 * }, TimeSpan.fromSeconds(3).toMilliseconds());
 *
 * const iterable: AsyncIterable<void> = {
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *     yield 2;
 *     yield 3;
 *     yield 4;
 *     yield 5;
 *   }
 * }
 *
 * (async () => {
 *   // Will throw AbortAsyncError
 *   for await (const item of delayIterable(iterable, TimeSpan.fromSeconds(1), abortController.signal)) {
 *     console.log(item);
 *   }
 * })();
 * ```
 */
export function delayIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    time: TimeSpan,
    abortSignal: AbortSignal = new AbortController().signal,
): AsyncIterable<TValue> {
    return new DelayIterable(iterable, time, abortSignal);
}

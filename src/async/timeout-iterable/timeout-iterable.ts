/**
 * @module Async
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AsyncError, AbortAsyncError } from "@/async/_shared";
import { abortableIterable } from "@/async/abortable-iterable/_module";
import type { TimeSpan } from "@/utilities/_module";

/**
 * The <i>timeoutIterable</i> function makes a <i>{@link AsyncIterable}</i> abort after a given <i>time</i> and you can also abort it on your own by passing <i>abortSignal</i>.
 * @group AsyncIterable utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @example
 * ```ts
 * import { timeoutIterable, delayIterable, TimeSpan } from "@daiso-tech/core";
 *
 * const iterable: AsyncIterable<void> = delayIterable({
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *     yield 2;
 *     yield 3;
 *     yield 4;
 *     yield 5;
 *     yield 6;
 *     yield 7;
 *     yield 8;
 *   }
 * }, TimeSpan.fromSeconds(1));
 *
 * (async () => {
 *   // Will throw an AbortAsyncError
 *   for (const item of timeoutIterable(iterable, TimeSpan.fromSeconds(5))) {
 *     console.log(item);
 *   }
 * })();
 * ```
 * @example with abortSignal
 * ```ts
 * import { timeoutIterable, delay, TimeSpan } from "@daiso-tech/core";
 *
 * const iterable: AsyncIterable<void> = delayIterable({
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *     yield 2;
 *     yield 3;
 *     yield 4;
 *     yield 5;
 *     yield 6;
 *     yield 7;
 *     yield 8;
 *   }
 * }, TimeSpan.fromSeconds(1));
 *
 * const abortController = new AbortController();
 * setTimeout(() => {
 *  abortController.abort("My abort message");
 * }, TimeSpan.fromSeconds(3));
 *
 * (async () => {
 *   // Will abort after 3 second by throwing AbortAsyncError
 *   for (const item of timeoutIterable(iterable, TimeSpan.fromSeconds(5), abortController.signal)) {
 *     console.log(item);
 *   }
 * })();
 * ```
 */
export function timeoutIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    time: TimeSpan,
    abortSignal: AbortSignal = new AbortController().signal,
): AsyncIterable<TValue> {
    return abortableIterable(
        iterable,
        AbortSignal.any([
            abortSignal,
            AbortSignal.timeout(time.toMilliseconds()),
        ]),
    );
}

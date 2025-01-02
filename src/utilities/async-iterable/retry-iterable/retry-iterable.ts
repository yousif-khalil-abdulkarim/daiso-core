/**
 * @module Async
 */
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RetryAsyncError,
} from "@/utilities/async/_shared";
import { retry } from "@/utilities/async/retry/retry";
import type { RetrySettings } from "@/utilities/async/retry/_module";

/**
 * @internal
 */
class RetryAsyncIterable<TValue> implements AsyncIterable<TValue> {
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly settings?: RetrySettings,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        let result = await retry(() => iterator.next(), this.settings);
        yield result.value;

        while (!result.done) {
            if (this.settings?.abortSignal?.aborted) {
                throw new AbortAsyncError(
                    `Promise was aborted with reason of "${String(this.settings.abortSignal.aborted)}"`,
                    this.settings.abortSignal.reason,
                );
            }
            result = await retry(() => iterator.next(), this.settings);
            if (result.done) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return result.value;
            }
            yield result.value;
        }
    }
}

/**
 * The <i>retryIterable</i> function will retry each iteration of {@link AsyncIterable} if it throws an error until given <i>settings.maxAttempts</i>.
 * You can add timeout for each retry by passing <i>settings.retryTimeout</i> and <i>settings.abortSignal</i> for aborting it on your own.
 * You can also customize the retry policy by passing <i>settings.retryPolicy</i> and custom backof policy by passing <i>settings.backoffPolicy</i>.
 * @group AsyncIterable utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @throws {RetryAsyncError} {@link RetryAsyncError}
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 * @example
 * ```ts
 * import { retryIterable, TimeSpan, exponentialBackoffPolicy } from "@daiso-tech/core";
 *
 * const iterable: AsyncIterable<void> = {
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *     throw new Error("My error mesasge");
 *   }
 * }
 *
 * (async () => {
 *   // Will throw RetryAsyncError after failing 4:th attempt
 *   for await (const item of retryIterable(iterable, {
 *     // You can choose the max retry attempts
 *     maxAttempts: 4,
 *     // You can provide a custom backoff policy
 *     backoffPolicy: exponentialBackoffPolicy(),
 *     // You can choose what error to retry, this function will retry all errors thrown
 *     retryPolicy: () => true,
 *     // You can provide a timeout for each retry
 *     retryTimeout: TimeSpan.fromMilliseconds(60_000),
 *   })) {
 *     console.log(item)
 *   }
 * })();
 * ```
 * @example with abortSignal
 * ```ts
 * import { retryIterable, TimeSpan } from "@daiso-tech/core";
 *
 * const iterable: AsyncIterable<void> = {
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *     throw new Error("My error mesasge");
 *   }
 * }
 *
 * (async () => {
 *   const abortController = new AbortController();
 *   abortController.abort("My abort message");
 *
 *   // Will be aborted by throwing AbortAsyncError
 *   for await (const item of retry(iterable, {
 *     abortSignal: abortController.signal
 *   })) {
 *     console.log(item)
 *   }
 * })();
 * ```
 * @example with abortSignal
 * ```ts
 * import { retryIterable, TimeSpan } from "@daiso-tech/core";
 *
 * class ErrorA extends Error {};
 * class ErrorB extends Error {};
 *
 * const iterable: AsyncIterable<void> = {
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *     throw new ErrorB("My error mesasge");
 *   }
 * }
 *
 *
 * (async () => {
 *   // Will not retry and ErrorB will be thrown
 *   for await (const item of retry(iterable, {
 *     retryPolicy: error => error instanceof ErrorA
 *   })) {
 *     console.log(item)
 *   }
 * })();
 * ```
 */
export function retryIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    settings?: RetrySettings,
): AsyncIterable<TValue> {
    return new RetryAsyncIterable(iterable, settings);
}

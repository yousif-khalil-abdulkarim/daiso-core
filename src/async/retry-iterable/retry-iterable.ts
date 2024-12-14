/**
 * @module Async
 */
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RetryAsyncError,
} from "@/async/_shared";
import { retry } from "@/async/retry/retry";
import type { RetrySettings } from "@/async/retry/_module";

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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const result = await retry(() => iterator.next(), this.settings);
            if (result.done) {
                return;
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
 */
export function retryIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    settings?: RetrySettings,
): AsyncIterable<TValue> {
    return new RetryAsyncIterable(iterable, settings);
}

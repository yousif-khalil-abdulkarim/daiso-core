/**
 * @module Async
 */

import { retryPromise } from "@/async/retry/retry-promise/retry-promise";
import type { RetrySettings } from "@/async/retry/retry-promise/_module";

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
            const result = await retryPromise(
                () => iterator.next(),
                this.settings,
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
export function retryAsyncIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    settings?: RetrySettings,
): AsyncIterable<TValue> {
    return new RetryAsyncIterable(iterable, settings);
}

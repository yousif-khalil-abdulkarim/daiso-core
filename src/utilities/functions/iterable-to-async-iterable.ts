/**
 * @module Utilities
 */

/**
 * @internal
 */
export function iterableToAsyncIterable<TItem>(
    iterable: Iterable<TItem>,
): AsyncIterable<TItem> {
    return {
        // eslint-disable-next-line @typescript-eslint/require-await
        async *[Symbol.asyncIterator](): AsyncIterator<TItem> {
            for (const item of iterable) {
                yield item;
            }
        },
    };
}

/**
 * @module Utilities
 */

/**
 * @internal
 */
export function arrayLikeToIterable<TItem>(
    arrayLike: ArrayLike<TItem>,
): Iterable<TItem> {
    return {
        *[Symbol.iterator](): Iterator<TItem> {
            for (let i = 0; i < arrayLike.length; i++) {
                const item = arrayLike[i];
                if (item === undefined) {
                    continue;
                }
                yield item;
            }
        },
    };
}

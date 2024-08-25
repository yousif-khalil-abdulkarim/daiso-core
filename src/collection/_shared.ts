/**
 * @module Collections
 */

/**
 * @internal
 */
class RangeIterable implements Iterable<number> {
    constructor(
        private from: number,
        private to: number,
    ) {}

    *[Symbol.iterator](): Iterator<number> {
        for (let i = this.from; i <= this.to; i++) {
            yield i;
        }
    }
}
/**
 * @example
 * const collection = new ListCollection(range(1, 10))
 * collection.toArray();
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * @group Utilities
 */
export function range(from: number, to: number): Iterable<number> {
    return new RangeIterable(from, to);
}

/**
 * @group Utilities
 */
export function isIterable<TItem>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
): value is Iterable<TItem> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return typeof value[Symbol.iterator] === "function";
}

/**
 * @group Utilities
 */
export function isAsyncIterable<TItem>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
): value is AsyncIterable<TItem> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return typeof value[Symbol.asyncIterator] === "function";
}

/**
 * @module Collection
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
 * The <i>range</i> function return a <i>{@link Iterable}</i> of numbers, starting from <i>from</i>,increments by 1 and stops at <i>to</i>.
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
 * The <i>isIterable</i> returns true if the value is <i>{@link Iterable}</i>.
 * @group Utilities
 */
export function isIterable<TItem>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    value: any,
): value is Iterable<TItem> {
    return (
        typeof value === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value[Symbol.iterator] === "function"
    );
}

/**
 * The <i>isAsyncIterable</i> returns true if the value is <i>{@link AsyncIterable}</i>.
 * @group Utilities
 */
export function isAsyncIterable<TItem>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    value: any,
): value is AsyncIterable<TItem> {
    return (
        typeof value === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value[Symbol.asyncIterator] === "function"
    );
}

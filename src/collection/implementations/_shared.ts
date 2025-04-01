/**
 * @module Collection
 */

import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import {
    CORE,
    resolveOneOrMore,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import {
    IterableCollection,
    ListCollection,
} from "@/collection/implementations/_module-exports.js";

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
 * The `range` function return a `{@link Iterable}` of numbers, starting from `from`,increments by 1 and stops at `to`.
 * @example
 * ```ts
 * import { ListCollection, range } from "@daiso-tech/core/collection";
 *
 * const collection = new ListCollection(range(1, 10))
 * collection.toArray();
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * ```
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection"`
 * @group Utilities
 */
export function range(from: number, to: number): Iterable<number> {
    return new RangeIterable(from, to);
}

/**
 * The `isIterable` returns true if the value is `{@link Iterable}`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection"`
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
 * The `isAsyncIterable` returns true if the value is `{@link AsyncIterable}`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection"`
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

/**
 * The `registerCollectionsToSerde` function registers the `ListCollection` and `IterableCollection` classes with `IFlexibleSerde`, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection"`
 * @group Errors
 */
export function registerCollectionsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerClass(ListCollection, CORE)
            .registerClass(IterableCollection, CORE);
    }
}

/**
 * @module Collection
 */

import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { CORE, type OneOrMore } from "@/utilities/_module-exports.js";
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
 * The <i>range</i> function return a <i>{@link Iterable}</i> of numbers, starting from <i>from</i>,increments by 1 and stops at <i>to</i>.
 * @example
 * ```ts
 * const collection = new ListCollection(range(1, 10))
 * collection.toArray();
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * ```
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/implementations"```
 * @group Utilities
 */
export function range(from: number, to: number): Iterable<number> {
    return new RangeIterable(from, to);
}

/**
 * The <i>isIterable</i> returns true if the value is <i>{@link Iterable}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/implementations"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/implementations"```
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
 * The <i>registerCollectionsToSerde</i> function registers the <i>ListCollection</i> and <i>IterableCollection</i> classes with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/implementations"```
 * @group Errors
 */
export function registerCollectionsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    if (!Array.isArray(serde)) {
        serde = [serde];
    }
    for (const serde_ of serde) {
        serde_
            .registerClass(ListCollection, CORE)
            .registerClass(IterableCollection, CORE);
    }
}

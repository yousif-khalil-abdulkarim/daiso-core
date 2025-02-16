/**
 * @module Collection
 */

import { type Comparator } from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class SortIterable<TInput> implements Iterable<TInput> {
    constructor(
        private iterable: Iterable<TInput>,
        private comparator?: Comparator<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        yield* [...this.iterable].sort(this.comparator);
    }
}

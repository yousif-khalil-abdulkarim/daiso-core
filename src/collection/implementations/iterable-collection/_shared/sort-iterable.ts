/**
 * @module Collection
 */

import { type Comparator } from "@/collection/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class SortIterable<TInput> implements Iterable<TInput> {
    constructor(
        private iterable: Iterable<TInput>,
        private comparator?: Comparator<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        if (this.comparator === undefined) {
            yield* [...this.iterable].sort();
            return;
        }
        yield* [...this.iterable].sort(resolveInvokable(this.comparator));
    }
}

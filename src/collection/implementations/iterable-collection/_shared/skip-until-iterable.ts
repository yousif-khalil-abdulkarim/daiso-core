/**
 * @module Collection
 */

import {
    type SyncPredicate,
    type ISyncCollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class SkipUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private predicateFn: SyncPredicate<TInput, ISyncCollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        let hasMatched = false;
        for (const [index, item] of this.collection.entries()) {
            if (!hasMatched) {
                hasMatched = this.predicateFn(item, index, this.collection);
            }
            if (hasMatched) {
                yield item;
            }
        }
    }
}

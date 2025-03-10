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
export class TakeUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private predicateFn: SyncPredicate<TInput, ISyncCollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        for (const [index, item] of this.collection.entries()) {
            if (this.predicateFn(item, index, this.collection)) {
                break;
            }
            yield item;
        }
    }
}

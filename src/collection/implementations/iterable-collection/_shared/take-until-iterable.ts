/**
 * @module Collection
 */

import {
    type SyncPredicate,
    type ICollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class TakeUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
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

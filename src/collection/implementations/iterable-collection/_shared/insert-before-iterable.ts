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
export class InsertBeforeIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ISyncCollection<TInput>,
        private predicateFn: SyncPredicate<TInput, ISyncCollection<TInput>>,
        private iterable: Iterable<TInput | TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        let hasMatched = false;
        for (const [index, item] of this.collection.entries()) {
            if (!hasMatched && this.predicateFn(item, index, this.collection)) {
                yield* this.iterable;
                hasMatched = true;
            }
            yield item;
        }
    }
}

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
export class FilterIterable<TInput, TOutput extends TInput>
    implements Iterable<TOutput>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: SyncPredicate<
            TInput,
            ICollection<TInput>,
            TOutput
        >,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        for (const [index, item] of this.collection.entries()) {
            if (this.predicateFn(item, index, this.collection)) {
                yield item as TOutput;
            }
        }
    }
}

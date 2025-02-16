/**
 * @module Collection
 */

import {
    type Predicate,
    type ICollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class InsertAfterIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,
        private iterable: Iterable<TInput | TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        let hasMatched = false;
        for (const [index, item] of this.collection.entries()) {
            yield item;
            if (!hasMatched && this.predicateFn(item, index, this.collection)) {
                yield* this.iterable;
                hasMatched = true;
            }
        }
    }
}

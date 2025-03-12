/**
 * @module Collection
 */

import {
    type PredicateInvokable,
    type ICollection,
} from "@/collection/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/functions.js";

/**
 * @internal
 */
export class InsertBeforeIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: PredicateInvokable<TInput, ICollection<TInput>>,
        private iterable: Iterable<TInput | TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        let hasMatched = false;
        for (const [index, item] of this.collection.entries()) {
            if (
                !hasMatched &&
                resolveInvokable(this.predicateFn)(item, index, this.collection)
            ) {
                yield* this.iterable;
                hasMatched = true;
            }
            yield item;
        }
    }
}

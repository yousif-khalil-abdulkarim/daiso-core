/**
 * @module Collection
 */

import {
    type PredicateInvokable,
    type ICollection,
} from "@/collection/contracts/_module.js";
import { resolveInvokable } from "@/utilities/_module.js";

/**
 * @internal
 */
export class SkipUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: PredicateInvokable<TInput, ICollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        let hasMatched = false;
        for (const [index, item] of this.collection.entries()) {
            if (!hasMatched) {
                hasMatched = resolveInvokable(this.predicateFn)(
                    item,
                    index,
                    this.collection,
                );
            }
            if (hasMatched) {
                yield item;
            }
        }
    }
}

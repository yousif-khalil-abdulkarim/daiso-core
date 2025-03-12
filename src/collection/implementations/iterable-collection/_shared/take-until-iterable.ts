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
export class TakeUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: PredicateInvokable<TInput, ICollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        for (const [index, item] of this.collection.entries()) {
            if (
                resolveInvokable(this.predicateFn)(item, index, this.collection)
            ) {
                break;
            }
            yield item;
        }
    }
}

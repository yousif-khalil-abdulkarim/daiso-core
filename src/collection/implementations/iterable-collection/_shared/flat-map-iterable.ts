/**
 * @module Collection
 */

import {
    type ICollection,
    type Map,
} from "@/collection/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/functions.js";

/**
 * @internal
 */
export class FlatMapIterable<TInput, TOutput> implements Iterable<TOutput> {
    constructor(
        private collection: ICollection<TInput>,
        private mapFn: Map<TInput, ICollection<TInput>, Iterable<TOutput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        for (const [index, item] of this.collection.entries()) {
            yield* resolveInvokable(this.mapFn)(item, index, this.collection);
        }
    }
}

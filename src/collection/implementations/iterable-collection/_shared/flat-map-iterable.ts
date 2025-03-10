/**
 * @module Collection
 */

import {
    type ICollection,
    type SyncMap,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class FlatMapIterable<TInput, TOutput> implements Iterable<TOutput> {
    constructor(
        private collection: ICollection<TInput>,
        private mapFn: SyncMap<TInput, ICollection<TInput>, Iterable<TOutput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        for (const [index, item] of this.collection.entries()) {
            yield* this.mapFn(item, index, this.collection);
        }
    }
}

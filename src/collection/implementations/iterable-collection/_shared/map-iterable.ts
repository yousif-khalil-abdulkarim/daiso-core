/**
 * @module Collection
 */

import {
    type ISyncCollection,
    type SyncMap,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class MapIterable<TInput, TOutput> implements Iterable<TOutput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private mapFn: SyncMap<TInput, ISyncCollection<TInput>, TOutput>,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        for (const [index, item] of this.collection.entries()) {
            yield this.mapFn(item, index, this.collection);
        }
    }
}

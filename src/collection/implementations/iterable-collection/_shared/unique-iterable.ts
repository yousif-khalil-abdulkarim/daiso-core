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
export class UniqueIterable<TInput, TOutput> implements Iterable<TInput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private callback: SyncMap<TInput, ISyncCollection<TInput>, TOutput> = (
            item,
        ) => item as unknown as TOutput,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        const set = new Set<TOutput>([]);

        for (const [index, item] of this.collection.entries()) {
            const item_ = this.callback(item, index, this.collection);
            if (!set.has(item_)) {
                yield item;
            }
            set.add(item_);
        }
    }
}

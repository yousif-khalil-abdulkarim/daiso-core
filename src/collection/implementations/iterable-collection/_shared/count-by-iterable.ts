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
export class CountByIterable<TInput, TOutput = TInput>
    implements Iterable<[TOutput, number]>
{
    constructor(
        private collection: ISyncCollection<TInput>,
        private selectFn: SyncMap<TInput, ISyncCollection<TInput>, TOutput> = (
            item,
        ) => item as unknown as TOutput,
    ) {}

    *[Symbol.iterator](): Iterator<[TOutput, number]> {
        const map = new Map<TOutput, number>();
        for (const [index, item] of this.collection.entries()) {
            const key = this.selectFn(item, index, this.collection);
            if (!map.has(key)) {
                map.set(key, 0);
            }
            const counter = map.get(key);
            if (counter !== undefined) {
                map.set(key, counter + 1);
            }
        }
        yield* map;
    }
}

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
export class GroupByIterable<TInput, TOutput = TInput>
    implements Iterable<[TOutput, ISyncCollection<TInput>]>
{
    constructor(
        private collection: ISyncCollection<TInput>,
        private selectFn: SyncMap<TInput, ISyncCollection<TInput>, TOutput> = (
            item,
        ) => item as unknown as TOutput,

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ISyncCollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<[TOutput, ISyncCollection<TInput>]> {
        const map = new Map<TOutput, Array<TInput>>();
        for (const [index, item] of this.collection.entries()) {
            const key = this.selectFn(item, index, this.collection);
            let array = map.get(key);
            if (array === undefined) {
                array = [];
                map.set(key, array);
            }
            array.push(item);
            map.set(key, array);
        }
        yield* this.makeCollection(map).map<[TOutput, ISyncCollection<TInput>]>(
            ([key, value]) => [key, this.makeCollection(value)],
        );
    }
}

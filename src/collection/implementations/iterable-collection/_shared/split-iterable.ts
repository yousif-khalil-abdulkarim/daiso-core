/**
 * @module Collection
 */

import { type ISyncCollection } from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class SplitIterable<TInput>
    implements Iterable<ISyncCollection<TInput>>
{
    constructor(
        private collection: ISyncCollection<TInput>,
        private chunkAmount: number,

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ISyncCollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ISyncCollection<TInput>> {
        const size = this.collection.size(),
            minChunkSize = Math.floor(size / this.chunkAmount),
            restSize = size % this.chunkAmount,
            chunkSizes = Array.from<number>({
                length: this.chunkAmount,
            }).fill(minChunkSize);

        for (let i = 1; i <= restSize; i++) {
            const chunkIndex = (i - 1) % this.chunkAmount;
            if (chunkSizes[chunkIndex]) {
                chunkSizes[chunkIndex] = chunkSizes[chunkIndex] + 1;
            }
        }

        const iterator = this.collection.toIterator();
        const array: TInput[] = [];
        for (const chunkSize of chunkSizes) {
            for (let i = 0; i < chunkSize; i++) {
                const item = iterator.next();
                if (item.value !== undefined) {
                    array.push(item.value);
                }
            }
            yield this.makeCollection(array);
            array.length = 0;
        }
    }
}

/**
 * @module Collection
 */

import { type ISyncCollection } from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class ChunkIterable<TInput>
    implements Iterable<ISyncCollection<TInput>>
{
    constructor(
        private collection: ISyncCollection<TInput>,
        private chunkSize: number,
        private readonly makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ISyncCollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ISyncCollection<TInput>> {
        const array: TInput[] = [];
        let currentChunkSize = 0;
        let isFirstIteration = true;
        for (const item of this.collection) {
            currentChunkSize %= this.chunkSize;
            const isFilled = currentChunkSize === 0;
            if (!isFirstIteration && isFilled) {
                yield this.makeCollection(array);
                array.length = 0;
            }
            array.push(item);
            currentChunkSize++;
            isFirstIteration = false;
        }
        const hasRest = currentChunkSize !== 0;
        if (hasRest) {
            yield this.makeCollection(array);
        }
    }
}

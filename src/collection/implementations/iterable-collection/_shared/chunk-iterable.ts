/**
 * @module Collection
 */

import { type ICollection } from "@/collection/contracts/_module";

/**
 * @internal
 */
export class ChunkIterable<TInput> implements Iterable<ICollection<TInput>> {
    constructor(
        private collection: ICollection<TInput>,
        private chunkSize: number,
        private readonly makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
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

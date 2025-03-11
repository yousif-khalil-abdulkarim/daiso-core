/**
 * @module Collection
 */

import { type ISyncCollection } from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class ReverseIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private chunkSize: number,

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ISyncCollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        yield* this.collection
            .chunk(this.chunkSize)
            .map((item) => this.makeCollection<TInput>([...item].reverse()))
            .reduce(
                (collection, item) => collection.prepend(item),
                this.makeCollection<TInput>([]),
            );
    }
}

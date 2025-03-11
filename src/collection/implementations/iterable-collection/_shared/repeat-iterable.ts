/**
 * @module Collection
 */

import { type ISyncCollection } from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class RepeatIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private amount: number,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ISyncCollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        let collection = this.makeCollection<TInput>([]);
        for (let index = 0; index < this.amount; index++) {
            collection = collection.append(this.collection);
        }
        yield* collection;
    }
}

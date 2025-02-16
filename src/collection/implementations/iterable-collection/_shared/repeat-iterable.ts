/**
 * @module Collection
 */

import { type ICollection } from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class RepeatIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private amount: number,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        let collection = this.makeCollection<TInput>([]);
        for (let index = 0; index < this.amount; index++) {
            collection = collection.append(this.collection);
        }
        yield* collection;
    }
}

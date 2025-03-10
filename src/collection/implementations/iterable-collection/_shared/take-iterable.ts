/**
 * @module Collection
 */

import { type ISyncCollection } from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class TakeIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private limit: number,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        if (this.limit < 0) {
            this.limit = this.collection.size() + this.limit;
        }
        yield* this.collection.takeWhile((_item, index) => index < this.limit);
    }
}

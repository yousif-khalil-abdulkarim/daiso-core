/**
 * @module Collection
 */

import {
    type Map,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class AsyncMapIterable<TInput, TOutput>
    implements AsyncIterable<TOutput>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private mapFn: Map<TInput, IAsyncCollection<TInput>, TOutput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TOutput> {
        for await (const [index, item] of this.collection.entries()) {
            yield this.mapFn(item, index, this.collection);
        }
    }
}

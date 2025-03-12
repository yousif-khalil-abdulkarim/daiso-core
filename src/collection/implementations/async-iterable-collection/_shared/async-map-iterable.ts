/**
 * @module Collection
 */

import {
    type AsyncMap,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/functions.js";

/**
 * @internal
 */
export class AsyncMapIterable<TInput, TOutput>
    implements AsyncIterable<TOutput>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TOutput> {
        for await (const [index, item] of this.collection.entries()) {
            yield resolveInvokable(this.mapFn)(item, index, this.collection);
        }
    }
}

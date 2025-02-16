/**
 * @module Collection
 */

import {
    type Comparator,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports";

/**
 * @internal
 */
export class AsyncSortIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private comparator?: Comparator<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        yield* [...(await this.collection.toArray())].sort(this.comparator);
    }
}

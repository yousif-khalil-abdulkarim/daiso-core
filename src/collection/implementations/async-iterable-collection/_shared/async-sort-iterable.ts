/**
 * @module Collection
 */

import {
    type Comparator,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class AsyncSortIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private comparator?: Comparator<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        if (this.comparator === undefined) {
            yield* [...(await this.collection.toArray())].sort();
            return;
        }
        yield* [...(await this.collection.toArray())].sort(
            resolveInvokable(this.comparator),
        );
    }
}

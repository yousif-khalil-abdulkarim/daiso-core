/**
 * @module Collection
 */

import {
    type Predicate,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class AsyncTakeUntilIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: Predicate<TInput, IAsyncCollection<TInput>>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        for await (const [index, item] of this.collection.entries()) {
            if (await this.predicateFn(item, index, this.collection)) {
                break;
            }
            yield item;
        }
    }
}

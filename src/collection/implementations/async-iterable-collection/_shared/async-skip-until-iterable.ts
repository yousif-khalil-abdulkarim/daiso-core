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
export class AsyncSkipUntilIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: Predicate<TInput, IAsyncCollection<TInput>>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        let hasMatched = false,
            index = 0;
        for await (const item of this.collection) {
            if (!hasMatched) {
                hasMatched = await this.predicateFn(
                    item,
                    index,
                    this.collection,
                );
            }
            if (hasMatched) {
                yield item;
            }
            index++;
        }
    }
}

/**
 * @module Collection
 */

import {
    type AsyncPredicate,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/functions.js";

/**
 * @internal
 */
export class AsyncSkipUntilIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        let hasMatched = false,
            index = 0;
        for await (const item of this.collection) {
            if (!hasMatched) {
                hasMatched = await resolveInvokable(this.predicateFn)(
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

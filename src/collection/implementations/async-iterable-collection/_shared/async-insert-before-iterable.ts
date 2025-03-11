/**
 * @module Collection
 */

import {
    type Predicate,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";
import { type AsyncIterableValue } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class AsyncInsertBeforeIterable<TInput, TExtended>
    implements AsyncIterable<TInput | TExtended>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: Predicate<TInput, IAsyncCollection<TInput>>,
        private iterable: AsyncIterableValue<TInput | TExtended>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput | TExtended> {
        let hasMatched = false,
            index = 0;
        for await (const item of this.collection) {
            if (
                !hasMatched &&
                (await this.predicateFn(item, index, this.collection))
            ) {
                yield* this.iterable;
                hasMatched = true;
            }
            yield item;
            index++;
        }
    }
}

/**
 * @module Collection
 */

import {
    type AsyncPredicate,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";
import { type AsyncIterableValue } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class AsyncPartionIterable<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        const arrayA: TInput[] = [];
        const arrayB: TInput[] = [];
        for await (const [index, item] of this.collection.entries()) {
            if (await this.predicateFn(item, index, this.collection)) {
                arrayA.push(item);
            } else {
                arrayB.push(item);
            }
        }
        yield this.makeCollection(arrayA);
        yield this.makeCollection(arrayB);
    }
}

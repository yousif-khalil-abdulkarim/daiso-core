/**
 * @module Collection
 */

import type { CrossJoinResult } from "@/collection/contracts/_module-exports.js";
import { type IAsyncCollection } from "@/collection/contracts/_module-exports.js";
import { type AsyncIterableValue } from "@/utilities/_module-exports.js";
import {
    isAsyncIterable,
    isIterable,
} from "@/collection/implementations/_shared.js";

/**
 * @internal
 */
export class AsyncCrossJoinIterable<TInput, TExtended>
    implements AsyncIterable<CrossJoinResult<TInput, TExtended>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private iterable: AsyncIterableValue<TExtended>,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        CrossJoinResult<TInput, TExtended>
    > {
        for await (const itemA of this.collection) {
            for await (const itemB of this.iterable) {
                let collection = this.makeCollection<TInput | TExtended>([]);
                if (
                    isIterable<TInput | TExtended>(itemA) ||
                    isAsyncIterable<TInput | TExtended>(itemA)
                ) {
                    collection = collection.append(itemA);
                } else {
                    collection = collection.append([itemA]);
                }
                if (
                    isIterable<TInput | TExtended>(itemB) ||
                    isAsyncIterable<TInput | TExtended>(itemB)
                ) {
                    collection = collection.append(itemB);
                } else {
                    collection = collection.append([itemB]);
                }
                yield (await collection.toArray()) as CrossJoinResult<
                    TInput,
                    TExtended
                >;
            }
        }
    }
}

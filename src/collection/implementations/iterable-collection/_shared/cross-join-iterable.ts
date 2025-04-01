/**
 * @module Collection
 */

import { isIterable } from "@/collection/implementations/_shared.js";
import type {
    CrossJoinResult,
    ICollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class CrossJoinIterable<TInput, TExtended = TInput>
    implements Iterable<CrossJoinResult<TInput, TExtended>>
{
    constructor(
        private readonly collection: ICollection<TInput>,
        private readonly iterable: Iterable<TExtended>,
        private readonly makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<CrossJoinResult<TInput, TExtended>> {
        for (const itemA of this.collection) {
            for (const itemB of this.iterable) {
                let collection = this.makeCollection<TInput | TExtended>([]);
                if (isIterable<TInput | TExtended>(itemA)) {
                    collection = collection.append(itemA);
                } else {
                    collection = collection.append([itemA]);
                }
                if (isIterable<TInput | TExtended>(itemB)) {
                    collection = collection.append(itemB);
                } else {
                    collection = collection.append([itemB]);
                }
                yield collection.toArray() as CrossJoinResult<
                    TInput,
                    TExtended
                >;
            }
        }
    }
}

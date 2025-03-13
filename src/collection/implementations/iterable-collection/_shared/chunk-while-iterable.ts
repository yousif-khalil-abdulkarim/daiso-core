/**
 * @module Collection
 */

import {
    type PredicateInvokable,
    type ICollection,
} from "@/collection/contracts/_module-exports.js";
import { resolveInvokable } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class ChunkWhileIterable<TInput>
    implements Iterable<ICollection<TInput>>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: PredicateInvokable<TInput, ICollection<TInput>>,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
        const array: TInput[] = [];
        for (const [index, item] of this.collection.entries()) {
            if (index === 0) {
                array.push(item);
            } else if (
                resolveInvokable(this.predicateFn)(
                    item,
                    index,
                    this.makeCollection(array),
                )
            ) {
                array.push(item);
            } else {
                yield this.makeCollection(array);
                array.length = 0;
                array.push(item);
            }
        }
        yield this.makeCollection(array);
    }
}

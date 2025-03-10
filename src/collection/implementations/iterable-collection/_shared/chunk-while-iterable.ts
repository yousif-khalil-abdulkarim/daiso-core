/**
 * @module Collection
 */

import {
    type SyncPredicate,
    type ISyncCollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class ChunkWhileIterable<TInput>
    implements Iterable<ISyncCollection<TInput>>
{
    constructor(
        private collection: ISyncCollection<TInput>,
        private predicateFn: SyncPredicate<TInput, ISyncCollection<TInput>>,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ISyncCollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ISyncCollection<TInput>> {
        const array: TInput[] = [];
        for (const [index, item] of this.collection.entries()) {
            if (index === 0) {
                array.push(item);
            } else if (
                this.predicateFn(item, index, this.makeCollection(array))
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

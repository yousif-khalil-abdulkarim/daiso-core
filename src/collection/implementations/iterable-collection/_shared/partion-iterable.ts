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
export class PartionIterable<TInput>
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
        const arrayA: TInput[] = [];
        const arrayB: TInput[] = [];
        for (const [index, item] of this.collection.entries()) {
            if (this.predicateFn(item, index, this.collection)) {
                arrayA.push(item);
            } else {
                arrayB.push(item);
            }
        }
        yield this.makeCollection(arrayA);
        yield this.makeCollection(arrayB);
    }
}

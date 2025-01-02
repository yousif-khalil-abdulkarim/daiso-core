/**
 * @module Collection
 */

import {
    type Predicate,
    type ICollection,
} from "@/collection/contracts/_module";

/**
 * @internal
 */
export class PartionIterable<TInput> implements Iterable<ICollection<TInput>> {
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
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

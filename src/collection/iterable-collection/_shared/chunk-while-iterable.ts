import {
    type Predicate,
    type ICollection,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class ChunkWhileIterable<TInput>
    implements Iterable<ICollection<TInput>>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,
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

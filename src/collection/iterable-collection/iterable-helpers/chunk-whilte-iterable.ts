import {
    CollectionError,
    type Filter,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class ChunkWhileIterable<TInput>
    implements Iterable<ICollection<TInput>>
{
    constructor(
        private collection: ICollection<TInput>,
        private filter: Filter<TInput, ICollection<TInput>>,
        private throwOnNumberLimit: boolean,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
        try {
            let collection: ICollection<TInput> = this.makeCollection<TInput>(
                [],
            );
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (index === 0) {
                    collection = collection.append([item]);
                } else if (this.filter(item, index, collection)) {
                    collection = collection.append([item]);
                } else {
                    yield collection;
                    collection = this.makeCollection<TInput>([item]);
                }
            }
            yield collection;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

import {
    CollectionError,
    UnexpectedCollectionError,
    type ICollection,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class ReverseIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private chunkSize: number,

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            const collection: ICollection<TInput> = this.makeCollection<TInput>(
                [],
            );
            yield* this.collection
                .chunk(this.chunkSize)
                .map((item) => this.makeCollection<TInput>([...item].reverse()))
                .reduce(
                    (collection, item) => collection.prepend(item),
                    collection,
                );
        } catch (error: unknown) {
            if (error instanceof CollectionError) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

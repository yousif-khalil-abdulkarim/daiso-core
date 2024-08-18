import {
    CollectionError,
    UnexpectedCollectionError,
    type ICollection,
} from "@/contracts/collection/_module";

export class RepeatIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private amount: number,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            let collection = this.makeCollection<TInput>([]);
            for (let index = 0; index < this.amount - 1; index++) {
                collection = collection.append(this.collection);
            }
            yield* collection;
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

import {
    CollectionError,
    type Filter,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class PartionIterable<TInput> implements Iterable<ICollection<TInput>> {
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
            let chunkA: ICollection<TInput> = this.makeCollection<TInput>([]),
                chunkB: ICollection<TInput> = this.makeCollection<TInput>([]);
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (this.filter(item, index, this.collection)) {
                    chunkA = chunkA.append([item]);
                } else {
                    chunkB = chunkB.append([item]);
                }
            }
            yield chunkA;
            yield chunkB;
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

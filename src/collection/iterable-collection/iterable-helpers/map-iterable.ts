import {
    CollectionError,
    type ICollection,
    type Map,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class MapIterable<TInput, TOutput> implements Iterable<TOutput> {
    constructor(
        private collection: ICollection<TInput>,
        private map: Map<TInput, ICollection<TInput>, TOutput>,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        try {
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                yield this.map(item, index, this.collection);
            }
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

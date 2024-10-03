import {
    CollectionError,
    type ICollection,
    type Map,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class MapIterable<TInput, TOutput> implements Iterable<TOutput> {
    constructor(
        private collection: ICollection<TInput>,
        private mapFn: Map<TInput, ICollection<TInput>, TOutput>,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        try {
            for (const [index, item] of this.collection.entries()) {
                yield this.mapFn(item, index, this.collection);
            }
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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

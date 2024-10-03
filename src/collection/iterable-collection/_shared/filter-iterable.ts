import {
    CollectionError,
    type Predicate,
    type ICollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class FilterIterable<TInput, TOutput extends TInput>
    implements Iterable<TOutput>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        try {
            for (const [index, item] of this.collection.entries()) {
                if (this.predicateFn(item, index, this.collection)) {
                    yield item as TOutput;
                }
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

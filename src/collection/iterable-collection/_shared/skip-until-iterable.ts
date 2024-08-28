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
export class SkipUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,
        private throwOnIndexOverflow: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            let hasMatched = false;
            for (const [index, item] of this.collection.entries(
                this.throwOnIndexOverflow,
            )) {
                if (!hasMatched) {
                    hasMatched = this.predicateFn(item, index, this.collection);
                }
                if (hasMatched) {
                    yield item;
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

import {
    CollectionError,
    type Predicate,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class InsertBeforeIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,
        private iterable: Iterable<TInput | TExtended>,
        private throwOnIndexOverflow: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        try {
            let hasMatched = false;
            for (const [index, item] of this.collection.entries(
                this.throwOnIndexOverflow,
            )) {
                if (
                    !hasMatched &&
                    this.predicateFn(item, index, this.collection)
                ) {
                    yield* this.iterable;
                    hasMatched = true;
                }
                yield item;
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
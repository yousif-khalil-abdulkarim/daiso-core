import {
    CollectionError,
    type Filter,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class InsertAfterIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private filter: Filter<TInput, ICollection<TInput>>,
        private iterable: Iterable<TInput | TExtended>,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        try {
            let hasMatched = false;
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                yield item;
                if (!hasMatched && this.filter(item, index, this.collection)) {
                    yield* this.iterable;
                    hasMatched = true;
                }
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

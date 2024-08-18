import {
    CollectionError,
    type Filter,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class FilterIterable<TInput, TOutput extends TInput>
    implements Iterable<TOutput>
{
    constructor(
        private collection: ICollection<TInput>,
        private filter: Filter<TInput, ICollection<TInput>, TOutput>,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        try {
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (this.filter(item, index, this.collection)) {
                    yield item as TOutput;
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

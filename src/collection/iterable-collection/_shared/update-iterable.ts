import {
    CollectionError,
    type Predicate,
    type ICollection,
    type Map,
    UnexpectedCollectionError,
    TypeCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class UpdateIterable<TInput, TFilterOutput extends TInput, TMapOutput>
    implements Iterable<UpdatedItem<TInput, TFilterOutput, TMapOutput>>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<
            TInput,
            ICollection<TInput>,
            TFilterOutput
        >,
        private mapFn: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
        private throwOnIndexOverflow: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<
        UpdatedItem<TInput, TFilterOutput, TMapOutput>
    > {
        try {
            for (const [index, item] of this.collection.entries(
                this.throwOnIndexOverflow,
            )) {
                if (this.predicateFn(item, index, this.collection)) {
                    yield this.mapFn(
                        item as TFilterOutput,
                        index,
                        this.collection,
                    );
                } else {
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

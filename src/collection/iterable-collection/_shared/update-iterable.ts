import {
    CollectionError,
    type Predicate,
    type ICollection,
    type Map,
    UnexpectedCollectionError,
    type ChangendItem,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class UpdateIterable<TInput, TFilterOutput extends TInput, TMapOutput>
    implements Iterable<ChangendItem<TInput, TFilterOutput, TMapOutput>>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<
            TInput,
            ICollection<TInput>,
            TFilterOutput
        >,
        private mapFn: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
    ) {}

    *[Symbol.iterator](): Iterator<
        ChangendItem<TInput, TFilterOutput, TMapOutput>
    > {
        try {
            for (const [index, item] of this.collection.entries()) {
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
            if (error instanceof CollectionError) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

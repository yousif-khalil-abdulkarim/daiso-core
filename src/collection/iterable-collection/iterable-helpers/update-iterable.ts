import {
    CollectionError,
    type Filter,
    type ICollection,
    type Map,
    UnexpectedCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_module";

export class UpdateIterable<TInput, TFilterOutput extends TInput, TMapOutput>
    implements Iterable<UpdatedItem<TInput, TFilterOutput, TMapOutput>>
{
    constructor(
        private collection: ICollection<TInput>,
        private filter: Filter<TInput, ICollection<TInput>, TFilterOutput>,
        private map: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<
        UpdatedItem<TInput, TFilterOutput, TMapOutput>
    > {
        try {
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (this.filter(item, index, this.collection)) {
                    yield this.map(
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

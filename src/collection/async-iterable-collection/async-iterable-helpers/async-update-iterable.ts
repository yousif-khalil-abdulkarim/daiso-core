import {
    type AsyncFilter,
    type AsyncMap,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncUpdateIterable<
    TInput,
    TFilterOutput extends TInput,
    TMapOutput,
> implements AsyncIterable<UpdatedItem<TInput, TFilterOutput, TMapOutput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private filter: AsyncFilter<
            TInput,
            IAsyncCollection<TInput>,
            TFilterOutput
        >,
        private map: AsyncMap<
            TFilterOutput,
            IAsyncCollection<TInput>,
            TMapOutput
        >,
        private throwOnNumberLimit: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        UpdatedItem<TInput, TFilterOutput, TMapOutput>
    > {
        try {
            for await (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (await this.filter(item, index, this.collection)) {
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

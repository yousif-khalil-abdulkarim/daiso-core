import {
    type AsyncPredicate,
    type AsyncMap,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
    type ChangendItem,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncUpdateIterable<
    TInput,
    TFilterOutput extends TInput,
    TMapOutput,
> implements AsyncIterable<ChangendItem<TInput, TFilterOutput, TMapOutput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TFilterOutput
        >,
        private mapFn: AsyncMap<
            TFilterOutput,
            IAsyncCollection<TInput>,
            TMapOutput
        >,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        ChangendItem<TInput, TFilterOutput, TMapOutput>
    > {
        try {
            for await (const [index, item] of this.collection.entries()) {
                if (await this.predicateFn(item, index, this.collection)) {
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

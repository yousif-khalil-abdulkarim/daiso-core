import {
    type AsyncFilter,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncFilterIterable<TInput, TOutput extends TInput>
    implements AsyncIterable<TOutput>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        private throwOnNumberLimit: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TOutput> {
        try {
            for await (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (await this.filter(item, index, this.collection)) {
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

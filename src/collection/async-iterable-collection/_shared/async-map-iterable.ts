import {
    type AsyncMap,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncMapIterable<TInput, TOutput>
    implements AsyncIterable<TOutput>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TOutput> {
        try {
            for await (const [index, item] of this.collection.entries()) {
                yield this.mapFn(item, index, this.collection);
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

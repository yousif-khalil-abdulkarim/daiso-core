import {
    type AsyncMap,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncFlatMapIterable<TInput, TOutput>
    implements AsyncIterable<TOutput>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private mapFn: AsyncMap<
            TInput,
            IAsyncCollection<TInput>,
            Iterable<TOutput>
        >,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TOutput> {
        try {
            for await (const [index, item] of this.collection.entries()) {
                yield* await this.mapFn(item, index, this.collection);
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

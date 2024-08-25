import {
    type AsyncPredicate,
    type AsyncIterableValue,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncChunkWhileIterable<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private filter: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        private throwOnIndexOverflow: boolean,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        try {
            let collection: IAsyncCollection<TInput> =
                this.makeCollection<TInput>([]);
            for await (const [index, item] of this.collection.entries(
                this.throwOnIndexOverflow,
            )) {
                if (index === 0) {
                    collection = collection.append([item]);
                } else if (await this.filter(item, index, collection)) {
                    collection = collection.append([item]);
                } else {
                    yield collection;
                    collection = this.makeCollection<TInput>([item]);
                }
            }
            yield collection;
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

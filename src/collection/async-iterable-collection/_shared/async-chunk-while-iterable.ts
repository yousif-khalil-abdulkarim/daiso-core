import {
    type AsyncPredicate,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

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

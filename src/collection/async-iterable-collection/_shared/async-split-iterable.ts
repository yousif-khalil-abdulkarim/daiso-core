import {
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncSplitIterable<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private chunkAmount: number,

        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        try {
            const size = await this.collection.size(),
                minChunkSize = Math.floor(size / this.chunkAmount),
                restSize = size % this.chunkAmount,
                chunkSizes = Array.from<number>({
                    length: this.chunkAmount,
                }).fill(minChunkSize);

            for (let i = 1; i <= restSize; i++) {
                const chunkIndex = (i - 1) % this.chunkAmount;
                if (chunkSizes[chunkIndex]) {
                    chunkSizes[chunkIndex] = chunkSizes[chunkIndex] + 1;
                }
            }

            const iterator = this.collection.toIterator();
            const array: TInput[] = [];
            for (const chunkSize of chunkSizes) {
                for (let i = 0; i < chunkSize; i++) {
                    const item = await iterator.next();
                    if (item.value !== undefined) {
                        array.push(item.value);
                    }
                }
                yield this.makeCollection(array);
                array.length = 0;
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

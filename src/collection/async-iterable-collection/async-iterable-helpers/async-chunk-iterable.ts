import {
    type AsyncIterableValue,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncChunkIterable<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private chunkSize: number,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        try {
            let chunk: IAsyncCollection<TInput> = this.makeCollection<TInput>(
                    [],
                ),
                currentChunkSize = 0,
                isFirstIteration = true;
            for await (const item of this.collection) {
                currentChunkSize %= this.chunkSize;
                const isFilled = currentChunkSize === 0;
                if (!isFirstIteration && isFilled) {
                    yield chunk;
                    chunk = this.makeCollection<TInput>([]);
                }
                chunk = chunk.append([item]);
                currentChunkSize++;
                isFirstIteration = false;
            }
            const hasRest = currentChunkSize !== 0;
            if (hasRest) {
                yield chunk;
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

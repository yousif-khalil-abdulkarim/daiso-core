import { type IAsyncCollection } from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

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
        const array: TInput[] = [];
        let currentChunkSize = 0;
        let isFirstIteration = true;
        for await (const item of this.collection) {
            currentChunkSize %= this.chunkSize;
            const isFilled = currentChunkSize === 0;
            if (!isFirstIteration && isFilled) {
                yield this.makeCollection(array);
                array.length = 0;
            }
            array.push(item);
            currentChunkSize++;
            isFirstIteration = false;
        }
        const hasRest = currentChunkSize !== 0;
        if (hasRest) {
            yield this.makeCollection(array);
        }
    }
}

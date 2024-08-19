import {
    type AsyncFilter,
    type AsyncIterableValue,
    CollectionError,
    type IAsyncCollection,
    IndexOverflowError,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncPartionIterable<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        private throwOnNumberLimit: boolean,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        try {
            let chunkA: IAsyncCollection<TInput> = this.makeCollection<TInput>(
                    [],
                ),
                chunkB: IAsyncCollection<TInput> = this.makeCollection<TInput>(
                    [],
                ),
                index = 0;
            for await (const item of this.collection) {
                if (
                    this.throwOnNumberLimit &&
                    index === Number.MAX_SAFE_INTEGER
                ) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (await this.filter(item, index, this.collection)) {
                    chunkA = chunkA.append([item]);
                } else {
                    chunkB = chunkB.append([item]);
                }
                index++;
            }
            yield chunkA;
            yield chunkB;
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

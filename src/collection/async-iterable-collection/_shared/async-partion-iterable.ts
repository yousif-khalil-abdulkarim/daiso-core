import {
    type AsyncPredicate,
    CollectionError,
    type IAsyncCollection,
    IndexOverflowCollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncPartionIterable<TInput>
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
            let chunkA: IAsyncCollection<TInput> = this.makeCollection<TInput>(
                    [],
                ),
                chunkB: IAsyncCollection<TInput> = this.makeCollection<TInput>(
                    [],
                ),
                index = 0;
            for await (const item of this.collection) {
                if (
                    this.throwOnIndexOverflow &&
                    index === Number.MAX_SAFE_INTEGER
                ) {
                    throw new IndexOverflowCollectionError(
                        "Index has overflowed",
                    );
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

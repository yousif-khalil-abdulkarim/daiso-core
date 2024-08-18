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
export class AsyncInsertBeforeIterable<TInput, TExtended>
    implements AsyncIterable<TInput | TExtended>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        private iterable: AsyncIterableValue<TInput | TExtended>,
        private throwOnNumberLimit: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput | TExtended> {
        try {
            let hasMatched = false,
                index = 0;
            for await (const item of this.collection) {
                if (
                    this.throwOnNumberLimit &&
                    index === Number.MAX_SAFE_INTEGER
                ) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (
                    !hasMatched &&
                    (await this.filter(item, index, this.collection))
                ) {
                    yield* this.iterable;
                    hasMatched = true;
                }
                yield item;
                index++;
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

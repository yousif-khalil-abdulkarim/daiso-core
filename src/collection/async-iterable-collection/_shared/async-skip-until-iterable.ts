import {
    type AsyncPredicate,
    CollectionError,
    type IAsyncCollection,
    IndexOverflowCollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncSkipUntilIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private filter: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        private throwOnIndexOverflow: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        try {
            let hasMatched = false,
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
                if (!hasMatched) {
                    hasMatched = await this.filter(
                        item,
                        index,
                        this.collection,
                    );
                }
                if (hasMatched) {
                    yield item;
                }
                index++;
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

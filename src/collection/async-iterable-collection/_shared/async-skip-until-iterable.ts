import {
    type AsyncPredicate,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncSkipUntilIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        try {
            let hasMatched = false,
                index = 0;
            for await (const item of this.collection) {
                if (!hasMatched) {
                    hasMatched = await this.predicateFn(
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

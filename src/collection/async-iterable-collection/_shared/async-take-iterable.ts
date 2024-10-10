import {
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncTakeIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private limit: number,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        try {
            if (this.limit < 0) {
                this.limit = (await this.collection.size()) + this.limit;
            }
            yield* this.collection.takeWhile(
                (_item, index) => index < this.limit,
            );
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

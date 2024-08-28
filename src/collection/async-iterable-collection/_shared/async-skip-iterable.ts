import {
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncSkipIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private limit: number,
        private throwOnIndexOverflow: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        try {
            if (this.limit < 0) {
                this.limit =
                    (await this.collection.size(this.throwOnIndexOverflow)) +
                    this.limit;
            }
            yield* this.collection.skipWhile(
                (_item, index) => index < this.limit,
                this.throwOnIndexOverflow,
            );
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

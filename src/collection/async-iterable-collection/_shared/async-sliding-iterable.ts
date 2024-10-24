import {
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncSlidingIteralbe<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private chunkSize: number,
        private step: number,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        try {
            if (this.step <= 0) {
                return;
            }
            const size = await this.collection.size();

            for (let index = 0; index < size; index += this.step) {
                const start = index;
                const end = index + this.chunkSize;

                yield this.collection.slice(start, end);

                if (end >= size) {
                    break;
                }
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

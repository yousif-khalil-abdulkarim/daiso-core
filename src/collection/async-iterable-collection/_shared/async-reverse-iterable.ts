import { type IAsyncCollection } from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncReverseIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private chunkSize: number,

        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        const collection: IAsyncCollection<TInput> =
            this.makeCollection<TInput>([]);
        yield* await this.collection
            .chunk(this.chunkSize)
            .map(async (item) =>
                this.makeCollection([...(await item.toArray())].reverse()),
            )
            .reduce((collection, item) => collection.prepend(item), collection);
    }
}

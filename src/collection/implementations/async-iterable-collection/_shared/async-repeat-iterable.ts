import { type IAsyncCollection } from "@/collection/contracts/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncRepeatIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private amount: number,
        private makeAsyncCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        let collection = this.makeAsyncCollection<TInput>([]);
        for (let index = 0; index < this.amount; index++) {
            collection = collection.append(this.collection);
        }
        yield* collection;
    }
}
import {
    type AsyncPredicate,
    type IAsyncCollection,
} from "@/collection/contracts/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncChunkWhileIterable<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,

        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        const array: TInput[] = [];
        for await (const [index, item] of this.collection.entries()) {
            if (index === 0) {
                array.push(item);
            } else if (
                await this.predicateFn(item, index, this.makeCollection(array))
            ) {
                array.push(item);
            } else {
                yield this.makeCollection(array);
                array.length = 0;
                array.push(item);
            }
        }
        yield this.makeCollection(array);
    }
}
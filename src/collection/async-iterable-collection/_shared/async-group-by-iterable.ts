import {
    type AsyncMap,
    type IAsyncCollection,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue, type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncGroupByIterable<TInput, TOutput = TInput>
    implements AsyncIterable<RecordItem<TOutput, IAsyncCollection<TInput>>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private selectFn: AsyncMap<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            item as any,

        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        RecordItem<TOutput, IAsyncCollection<TInput>>
    > {
        const map = new Map<TOutput, Array<TInput>>();
        for await (const [index, item] of this.collection.entries()) {
            const key = await this.selectFn(item, index, this.collection);
            let array = map.get(key);
            if (array === undefined) {
                array = [];
                map.set(key, array);
            }
            array.push(item);
            map.set(key, array);
        }
        yield* this.makeCollection(map).map<
            RecordItem<TOutput, IAsyncCollection<TInput>>
        >(([key, value]) => [key, this.makeCollection(value)]);
    }
}

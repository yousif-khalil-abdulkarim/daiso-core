import {
    type AsyncMap,
    type IAsyncCollection,
} from "@/collection/contracts/_module";
import { type RecordItem } from "@/_shared/types";
/**
 * @internal
 */
export class AsyncCountByIterable<TInput, TOutput = TInput>
    implements AsyncIterable<RecordItem<TOutput, number>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private callback: AsyncMap<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = (item) => item as unknown as TOutput,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        RecordItem<TOutput, number>
    > {
        const map = new Map<TOutput, number>();
        for await (const [index, item] of this.collection.entries()) {
            const key = await this.callback(item, index, this.collection);
            if (!map.has(key)) {
                map.set(key, 0);
            }
            const counter = map.get(key);
            if (counter !== undefined) {
                map.set(key, counter + 1);
            }
        }
        yield* map;
    }
}
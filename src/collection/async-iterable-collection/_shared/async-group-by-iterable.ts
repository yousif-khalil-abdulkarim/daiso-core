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
        private callback: AsyncMap<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            item as any,
        private throwOnIndexOverflow: boolean,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        RecordItem<TOutput, IAsyncCollection<TInput>>
    > {
        const map = new Map<TOutput, IAsyncCollection<TInput>>();

        for await (const [index, item] of this.collection.entries(
            this.throwOnIndexOverflow,
        )) {
            const key = await this.callback(item, index, this.collection);
            let collection: IAsyncCollection<TInput> | undefined = map.get(key);
            if (collection === undefined) {
                collection = this.makeCollection<TInput>([]);
                map.set(key, collection);
            }

            map.set(key, collection.append([item]));
        }
        yield* map;
    }
}

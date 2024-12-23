import {
    type AsyncMap,
    type IAsyncCollection,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncUniqueIterable<TInput, TOutput>
    implements AsyncIterable<TInput>
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
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        const set = new Set<TOutput>([]);
        for await (const [index, item] of this.collection.entries()) {
            const item_ = await this.callback(item, index, this.collection);
            if (!set.has(item_)) {
                yield item;
            }
            set.add(item_);
        }
    }
}

import {
    type AsyncMap,
    CollectionError,
    type IAsyncCollection,
    type RecordItem,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

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
        > = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            item as any,
        private throwOnNumberLimit: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        RecordItem<TOutput, number>
    > {
        try {
            const map = new Map<TOutput, number>();
            for await (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
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

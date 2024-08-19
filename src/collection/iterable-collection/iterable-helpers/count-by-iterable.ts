import {
    CollectionError,
    type ICollection,
    type Map,
    type RecordItem,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class CountByIterable<TInput, TOutput = TInput>
    implements Iterable<RecordItem<TOutput, number>>
{
    constructor(
        private collection: ICollection<TInput>,
        private callback: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            item as any,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<RecordItem<TOutput, number>> {
        try {
            const map = new Map<TOutput, number>();
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                const key = this.callback(item, index, this.collection);
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

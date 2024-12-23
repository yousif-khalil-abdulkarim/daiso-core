import { type ICollection, type Map } from "@/contracts/collection/_module";
import { type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class CountByIterable<TInput, TOutput = TInput>
    implements Iterable<RecordItem<TOutput, number>>
{
    constructor(
        private collection: ICollection<TInput>,
        private selectFn: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            item as any,
    ) {}

    *[Symbol.iterator](): Iterator<RecordItem<TOutput, number>> {
        const map = new Map<TOutput, number>();
        for (const [index, item] of this.collection.entries()) {
            const key = this.selectFn(item, index, this.collection);
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

/**
 * @module Collection
 */

import { type ICollection, type Map } from "@/collection/contracts/_module";
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
            item as unknown as TOutput,
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

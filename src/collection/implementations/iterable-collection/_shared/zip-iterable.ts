import {} from "@/collection/contracts/_module";
import { type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class ZipIterable<TInput, TExtended>
    implements Iterable<RecordItem<TInput, TExtended>>
{
    constructor(
        private iterableA: Iterable<TInput>,
        private iterableB: Iterable<TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<RecordItem<TInput, TExtended>> {
        const iteratorA = this.iterableA[Symbol.iterator](),
            iteratorB = this.iterableB[Symbol.iterator]();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const itemA = iteratorA.next(),
                itemB = iteratorB.next();
            if (itemA.done || itemB.done) {
                break;
            }
            yield [itemA.value, itemB.value];
        }
    }
}

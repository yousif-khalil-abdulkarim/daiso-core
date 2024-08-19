import { isIterable } from "@/collection/_shared";
import {
    type AsyncIterableValue,
    type RecordItem,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncZipIterable<TInput, TExtended>
    implements AsyncIterable<RecordItem<TInput, TExtended>>
{
    constructor(
        private iterableA: AsyncIterableValue<TInput>,
        private iterableB: AsyncIterableValue<TExtended>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        RecordItem<TInput, TExtended>
    > {
        let iteratorA: AsyncIterator<TInput> | Iterator<TInput>;
        if (isIterable(this.iterableA)) {
            iteratorA = this.iterableA[Symbol.iterator]();
        } else {
            iteratorA = this.iterableA[Symbol.asyncIterator]();
        }

        let iteratorB: AsyncIterator<TExtended> | Iterator<TExtended>;
        if (isIterable(this.iterableB)) {
            iteratorB = this.iterableB[Symbol.iterator]();
        } else {
            iteratorB = this.iterableB[Symbol.asyncIterator]();
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const itemA = await iteratorA.next(),
                itemB = await iteratorB.next();
            if (itemA.done || itemB.done) {
                break;
            }
            yield [itemA.value, itemB.value];
        }
    }
}

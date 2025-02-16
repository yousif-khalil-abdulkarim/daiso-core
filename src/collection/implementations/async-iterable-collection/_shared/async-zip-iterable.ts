/**
 * @module Collection
 */

import { isIterable } from "@/collection/implementations/_shared.js";
import { type AsyncIterableValue } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class AsyncZipIterable<TInput, TExtended>
    implements AsyncIterable<[TInput, TExtended]>
{
    constructor(
        private iterableA: AsyncIterableValue<TInput>,
        private iterableB: AsyncIterableValue<TExtended>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<[TInput, TExtended]> {
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

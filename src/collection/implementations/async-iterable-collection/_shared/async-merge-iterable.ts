/**
 * @module Collection
 */

import { type AsyncIterableValue } from "@/utilities/_module";

/**
 * @internal
 */
export class AsyncMergeIterable<TInput, TExtended>
    implements AsyncIterable<TInput | TExtended>
{
    constructor(
        private iterableA: AsyncIterableValue<TInput>,
        private iterableB: AsyncIterableValue<TExtended>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput | TExtended> {
        yield* this.iterableA;
        yield* this.iterableB;
    }
}

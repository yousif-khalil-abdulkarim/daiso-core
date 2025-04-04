/**
 * @module Collection
 */

import { isIterable } from "@/collection/implementations/_shared.js";
import { type AsyncIterableValue } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class AsyncMergeIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private readonly iterables: AsyncIterableValue<
            AsyncIterableValue<TInput>
        >,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        if (isIterable(this.iterables)) {
            for (const iterable of this.iterables) {
                yield* iterable;
            }
        } else {
            for await (const iterable of this.iterables) {
                yield* iterable;
            }
        }
    }
}

/**
 * @module Collection
 */

import { type AsyncIterableValue } from "@/utilities/_module";

/**
 * @internal
 */
export class AsyncEntriesIterable<TInput>
    implements AsyncIterable<[number, TInput]>
{
    constructor(private iterable: AsyncIterableValue<TInput>) {}

    async *[Symbol.asyncIterator](): AsyncIterator<[number, TInput]> {
        let index = 0;
        for await (const item of this.iterable) {
            yield [index, item];
            index++;
        }
    }
}

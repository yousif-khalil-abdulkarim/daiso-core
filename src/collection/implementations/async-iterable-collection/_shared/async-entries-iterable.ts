/**
 * @module Collection
 */

import { type AsyncIterableValue } from "@/_shared/types";
import { type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncEntriesIterable<TInput>
    implements AsyncIterable<RecordItem<number, TInput>>
{
    constructor(private iterable: AsyncIterableValue<TInput>) {}

    async *[Symbol.asyncIterator](): AsyncIterator<RecordItem<number, TInput>> {
        let index = 0;
        for await (const item of this.iterable) {
            yield [index, item];
            index++;
        }
    }
}

import {
    type RecordItem,
    IndexOverflowError,
} from "@/contracts/collection/_shared";
import type { AsyncIterableValue } from "@/contracts/collection/async-collection.contract";

/**
 * @internal
 */
export class AsyncEntriesIterable<TInput>
    implements AsyncIterable<RecordItem<number, TInput>>
{
    constructor(
        private iterable: AsyncIterableValue<TInput>,
        private throwOnNumberLimit: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<RecordItem<number, TInput>> {
        let index = 0;
        for await (const item of this.iterable) {
            if (this.throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                throw new IndexOverflowError("Index has overflowed");
            }
            yield [index, item];
            index++;
        }
    }
}

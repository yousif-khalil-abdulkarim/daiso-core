import { IndexOverflowCollectionError } from "@/contracts/collection/_shared";
import { type AsyncIterableValue } from "@/_shared/types";
import { type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncEntriesIterable<TInput>
    implements AsyncIterable<RecordItem<number, TInput>>
{
    constructor(
        private iterable: AsyncIterableValue<TInput>,
        private throwOnIndexOverflow: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<RecordItem<number, TInput>> {
        let index = 0;
        for await (const item of this.iterable) {
            if (
                this.throwOnIndexOverflow &&
                index === Number.MAX_SAFE_INTEGER
            ) {
                throw new IndexOverflowCollectionError("Index has overflowed");
            }
            yield [index, item];
            index++;
        }
    }
}

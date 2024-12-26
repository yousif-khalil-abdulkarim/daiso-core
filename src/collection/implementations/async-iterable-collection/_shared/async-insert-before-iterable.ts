import {
    type AsyncPredicate,
    type IAsyncCollection,
} from "@/collection/contracts/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncInsertBeforeIterable<TInput, TExtended>
    implements AsyncIterable<TInput | TExtended>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        private iterable: AsyncIterableValue<TInput | TExtended>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput | TExtended> {
        let hasMatched = false,
            index = 0;
        for await (const item of this.collection) {
            if (
                !hasMatched &&
                (await this.predicateFn(item, index, this.collection))
            ) {
                yield* this.iterable;
                hasMatched = true;
            }
            yield item;
            index++;
        }
    }
}

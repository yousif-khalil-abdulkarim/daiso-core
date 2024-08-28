import {
    type AsyncPredicate,
    CollectionError,
    type IAsyncCollection,
    IndexOverflowCollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncInsertBeforeIterable<TInput, TExtended>
    implements AsyncIterable<TInput | TExtended>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private filter: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        private iterable: AsyncIterableValue<TInput | TExtended>,
        private throwOnIndexOverflow: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput | TExtended> {
        try {
            let hasMatched = false,
                index = 0;
            for await (const item of this.collection) {
                if (
                    this.throwOnIndexOverflow &&
                    index === Number.MAX_SAFE_INTEGER
                ) {
                    throw new IndexOverflowCollectionError(
                        "Index has overflowed",
                    );
                }
                if (
                    !hasMatched &&
                    (await this.filter(item, index, this.collection))
                ) {
                    yield* this.iterable;
                    hasMatched = true;
                }
                yield item;
                index++;
            }
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

import {
    type RecordItem,
    CollectionError,
    IndexOverflowError,
    UnexpectedCollectionError,
} from "@/contracts/collection/_shared";

/**
 * @internal
 */
export class EntriesIterable<TInput>
    implements Iterable<RecordItem<number, TInput>>
{
    constructor(
        private iterable: Iterable<TInput>,
        private throwOnIndexOverflow: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<RecordItem<number, TInput>> {
        try {
            let index = 0;
            for (const item of this.iterable) {
                if (
                    this.throwOnIndexOverflow &&
                    index === Number.MAX_SAFE_INTEGER
                ) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                yield [index, item];
                index++;
            }
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
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
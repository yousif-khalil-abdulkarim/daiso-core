import {
    CollectionError,
    UnexpectedCollectionError,
} from "@/contracts/collection/_shared";
import { type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class EntriesIterable<TInput>
    implements Iterable<RecordItem<number, TInput>>
{
    constructor(private iterable: Iterable<TInput>) {}

    *[Symbol.iterator](): Iterator<RecordItem<number, TInput>> {
        try {
            let index = 0;
            for (const item of this.iterable) {
                yield [index, item];
                index++;
            }
        } catch (error: unknown) {
            if (error instanceof CollectionError) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

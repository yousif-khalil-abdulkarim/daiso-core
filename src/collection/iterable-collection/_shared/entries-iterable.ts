import {} from "@/contracts/collection/_shared";
import { type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class EntriesIterable<TInput>
    implements Iterable<RecordItem<number, TInput>>
{
    constructor(private iterable: Iterable<TInput>) {}

    *[Symbol.iterator](): Iterator<RecordItem<number, TInput>> {
        let index = 0;
        for (const item of this.iterable) {
            yield [index, item];
            index++;
        }
    }
}

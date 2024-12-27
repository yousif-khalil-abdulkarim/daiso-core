import {
    type Predicate,
    type ICollection,
} from "@/collection/contracts/_module";

/**
 * @internal
 */
export class InsertBeforeIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,
        private iterable: Iterable<TInput | TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        let hasMatched = false;
        for (const [index, item] of this.collection.entries()) {
            if (!hasMatched && this.predicateFn(item, index, this.collection)) {
                yield* this.iterable;
                hasMatched = true;
            }
            yield item;
        }
    }
}

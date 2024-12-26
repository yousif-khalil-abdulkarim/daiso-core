import {
    type Predicate,
    type ICollection,
} from "@/collection/contracts/_module";

/**
 * @internal
 */
export class SkipUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        let hasMatched = false;
        for (const [index, item] of this.collection.entries()) {
            if (!hasMatched) {
                hasMatched = this.predicateFn(item, index, this.collection);
            }
            if (hasMatched) {
                yield item;
            }
        }
    }
}

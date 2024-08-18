import {
    CollectionError,
    type Filter,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class SkipUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private filter: Filter<TInput, ICollection<TInput>>,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            let hasMatched = false;
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (!hasMatched) {
                    hasMatched = this.filter(item, index, this.collection);
                }
                if (hasMatched) {
                    yield item;
                }
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

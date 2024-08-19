import {
    CollectionError,
    type Filter,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class TakeUntilIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private filter: Filter<TInput, ICollection<TInput>>,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            for (const [index, item] of this.collection.entries(
                this.throwOnNumberLimit,
            )) {
                if (this.filter(item, index, this.collection)) {
                    break;
                }
                yield item;
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

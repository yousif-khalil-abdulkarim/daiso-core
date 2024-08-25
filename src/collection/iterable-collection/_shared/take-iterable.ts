import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class TakeIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private limit: number,
        private throwOnIndexOverflow: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            if (this.limit < 0) {
                this.limit =
                    this.collection.size(this.throwOnIndexOverflow) +
                    this.limit;
            }
            yield* this.collection.takeWhile(
                (_item, index) => index < this.limit,
                this.throwOnIndexOverflow,
            );
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
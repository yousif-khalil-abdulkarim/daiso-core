import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class SkipIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private offset: number,
        private throwOnIndexOverflow: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            if (this.offset < 0) {
                this.offset =
                    this.collection.size(this.throwOnIndexOverflow) +
                    this.offset;
            }
            yield* this.collection.skipWhile(
                (_item, index) => index < this.offset,
                this.throwOnIndexOverflow,
            );
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

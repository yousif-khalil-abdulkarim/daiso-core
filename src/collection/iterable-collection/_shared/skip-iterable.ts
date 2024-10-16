import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class SkipIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private offset: number,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            if (this.offset < 0) {
                this.offset = this.collection.size() + this.offset;
            }
            yield* this.collection.skipWhile(
                (_item, index) => index < this.offset,
            );
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

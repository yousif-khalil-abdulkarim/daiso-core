import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class SkipIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private offset: number,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            if (this.offset < 0) {
                this.offset =
                    this.collection.size(this.throwOnNumberLimit) + this.offset;
            }
            yield* this.collection.skipWhile(
                (_item, index) => index < this.offset,
                this.throwOnNumberLimit,
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

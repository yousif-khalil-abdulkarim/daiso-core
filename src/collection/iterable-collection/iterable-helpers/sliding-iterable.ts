import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class SlidingIteralbe<TInput> implements Iterable<ICollection<TInput>> {
    constructor(
        private collection: ICollection<TInput>,
        private chunkSize: number,
        private step: number,
        private throwOnNumberLimit: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
        try {
            if (this.step <= 0) {
                return;
            }
            const size = this.collection.size(this.throwOnNumberLimit);

            for (let index = 0; index < size; index += this.step) {
                const start = index;
                const end = index + this.chunkSize;

                yield this.collection.slice({
                    start,
                    end,
                    throwOnNumberLimit: this.throwOnNumberLimit,
                });

                if (end >= size) {
                    break;
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

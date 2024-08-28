import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class SplitIterable<TInput> implements Iterable<ICollection<TInput>> {
    constructor(
        private collection: ICollection<TInput>,
        private chunkAmount: number,
        private throwOnIndexOverflow: boolean,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
        try {
            const size = this.collection.size(this.throwOnIndexOverflow),
                minChunkSize = Math.floor(size / this.chunkAmount),
                restSize = size % this.chunkAmount,
                chunkSizes = Array.from<number>({
                    length: this.chunkAmount,
                }).fill(minChunkSize);

            for (let i = 1; i <= restSize; i++) {
                const chunkIndex = (i - 1) % this.chunkAmount;
                if (chunkSizes[chunkIndex]) {
                    chunkSizes[chunkIndex] = chunkSizes[chunkIndex] + 1;
                }
            }

            const iterator = this.collection.toIterator();
            for (const chunkSize of chunkSizes) {
                let collection: ICollection<TInput> =
                    this.makeCollection<TInput>([]);
                for (let i = 0; i < chunkSize; i++) {
                    const item = iterator.next();
                    if (item.value !== undefined) {
                        collection = collection.append([item.value]);
                    }
                }
                yield collection;
            }
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

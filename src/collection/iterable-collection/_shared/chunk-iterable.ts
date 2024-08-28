import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class ChunkIterable<TInput> implements Iterable<ICollection<TInput>> {
    constructor(
        private collection: ICollection<TInput>,
        private chunkSize: number,
        private readonly makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
        try {
            let chunk: ICollection<TInput> = this.makeCollection<TInput>([]),
                currentChunkSize = 0,
                isFirstIteration = true;
            for (const item of this.collection) {
                currentChunkSize %= this.chunkSize;
                const isFilled = currentChunkSize === 0;
                if (!isFirstIteration && isFilled) {
                    yield chunk;
                    chunk = this.makeCollection<TInput>([]);
                }
                chunk = chunk.append([item]);
                currentChunkSize++;
                isFirstIteration = false;
            }
            const hasRest = currentChunkSize !== 0;
            if (hasRest) {
                yield chunk;
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

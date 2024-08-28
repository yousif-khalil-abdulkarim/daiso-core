import {
    CollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_shared";

/**
 * @internal
 */
export class ShuffleIterable<TInput> implements Iterable<TInput> {
    constructor(private iterable: Iterable<TInput>) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            const newArray = [...this.iterable];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = newArray[i];
                if (newArray[j] !== undefined) {
                    newArray[i] = newArray[j];
                }
                if (temp !== undefined) {
                    newArray[j] = temp;
                }
            }
            yield* newArray;
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

import {
    CollectionError,
    UnexpectedCollectionError,
    type Comparator,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class SortIterable<TInput> implements Iterable<TInput> {
    constructor(
        private iterable: Iterable<TInput>,
        private comparator?: Comparator<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            yield* [...this.iterable].sort(this.comparator);
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

import {
    CollectionError,
    UnexpectedCollectionError,
    type Comparator,
} from "@/contracts/collection/_module";

export class SortIterable<TInput> implements Iterable<TInput> {
    constructor(
        private iterable: Iterable<TInput>,
        private compare?: Comparator<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            yield* [...this.iterable].sort(this.compare);
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

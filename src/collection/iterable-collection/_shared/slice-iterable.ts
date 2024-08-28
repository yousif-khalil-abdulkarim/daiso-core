import {
    CollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
    type ICollection,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class SliceIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private start: number | undefined,
        private end: number | undefined,
        private throwOnIndexOverflow: boolean,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            const size = this.collection.size();
            let { start, end } = this;
            if (start === undefined) {
                start = 0;
            }
            if (end === undefined) {
                end = size;
            }
            if (start < 0) {
                start = size + start;
            }
            if (end < 0) {
                end = size + end;
            }
            yield* this.collection.filter((_item, index) => {
                return start <= index && index < end;
            }, this.throwOnIndexOverflow);
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

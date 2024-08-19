import {
    CollectionError,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class MergeIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private iterableA: Iterable<TInput>,
        private iterableB: Iterable<TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        try {
            yield* this.iterableA;
            yield* this.iterableB;
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

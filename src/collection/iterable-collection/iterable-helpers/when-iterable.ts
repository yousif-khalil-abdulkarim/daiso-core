import {
    CollectionError,
    type ICollection,
    type Modifier,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class WhenIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private condition: () => boolean,
        private callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        try {
            if (this.condition()) {
                yield* this.callback(this.collection);
                return;
            }
            yield* this.collection as ICollection<TInput | TExtended>;
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

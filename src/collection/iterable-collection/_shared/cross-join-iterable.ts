import {
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class CrossJoinIterable<TInput, TExtended = TInput>
    implements Iterable<ICollection<TInput | TExtended>>
{
    constructor(
        private collection: ICollection<TInput>,
        private iterables: Array<Iterable<TExtended>>,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput | TExtended>> {
        try {
            yield* this.makeCollection<ICollection<TInput | TExtended>>([
                this.collection,
                ...this.iterables.map<ICollection<TExtended>>((iterable) =>
                    this.makeCollection(iterable),
                ),
            ]).reduce<ICollection<ICollection<TInput | TExtended>>>({
                reduceFn: (a, b) => {
                    return a
                        .map((x) =>
                            b.map((y) => {
                                return x.append([y]);
                            }),
                        )
                        .reduce<ICollection<ICollection<TInput | TExtended>>>({
                            reduceFn: (c, b) => c.append(b),
                            initialValue: this.makeCollection<
                                ICollection<TInput | TExtended>
                            >([]),
                        });
                },
                initialValue: this.makeCollection<
                    ICollection<TInput | TExtended>
                >([this.makeCollection<TInput | TExtended>([])]),
            });
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

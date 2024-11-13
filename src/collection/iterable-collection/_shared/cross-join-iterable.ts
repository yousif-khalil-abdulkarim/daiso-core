import { isIterable } from "@/collection/_module";
import type {
    CrossJoinResult,
    ICollection,
} from "@/contracts/collection/_module";
import {
    CollectionError,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class CrossJoinIterable<TInput, TExtended = TInput>
    implements Iterable<CrossJoinResult<TInput, TExtended>>
{
    constructor(
        private collection: ICollection<TInput>,
        private iterable: Iterable<TExtended>,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<CrossJoinResult<TInput, TExtended>> {
        try {
            const combinations = this.makeCollection([
                this.collection,
                this.makeCollection(this.iterable),
            ] as ICollection<TInput | TExtended>[])
                .reduce<ICollection<Array<TInput | TExtended>>>(
                    (a, b) => {
                        return a
                            .map((x) => {
                                return b.map((y) => {
                                    return [...x, y];
                                });
                            })
                            .reduce<ICollection<Array<TInput | TExtended>>>(
                                (c, b) => c.append(b),
                                this.makeCollection<Array<TInput | TExtended>>(
                                    [],
                                ),
                            );
                    },
                    this.makeCollection([[] as Array<TInput | TExtended>]),
                )
                .map((combination) => {
                    // Flatting the array
                    return combination.reduce<Array<TInput | TExtended>>(
                        (a, b) => {
                            return [
                                ...a,
                                ...(isIterable(b) ? b : [b]),
                            ] as Array<TInput | TExtended>;
                        },
                        [],
                    );
                });
            yield* combinations as Iterable<CrossJoinResult<TInput, TExtended>>;
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

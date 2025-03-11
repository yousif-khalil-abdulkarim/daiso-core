/**
 * @module Collection
 */

import { isIterable } from "@/collection/implementations/_shared.js";
import type {
    CrossJoinResult,
    ICollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
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
                            this.makeCollection<Array<TInput | TExtended>>([]),
                        );
                },
                this.makeCollection([[] as Array<TInput | TExtended>]),
            )
            .map((combination) => {
                // Flatting the array
                return combination.reduce<Array<TInput | TExtended>>((a, b) => {
                    return [...a, ...(isIterable(b) ? b : [b])] as Array<
                        TInput | TExtended
                    >;
                }, []);
            });
        yield* combinations as Iterable<CrossJoinResult<TInput, TExtended>>;
    }
}

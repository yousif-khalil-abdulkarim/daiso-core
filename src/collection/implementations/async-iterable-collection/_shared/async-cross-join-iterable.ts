/**
 * @module Collection
 */

import type { CrossJoinResult } from "@/collection/contracts/_module";
import { type IAsyncCollection } from "@/collection/contracts/_module";
import { type AsyncIterableValue } from "@/utilities/_module";
import { isIterable } from "@/collection/implementations/_shared";

/**
 * @internal
 */
export class AsyncCrossJoinIterable<TInput, TExtended>
    implements AsyncIterable<CrossJoinResult<TInput, TExtended>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private iterable: AsyncIterableValue<TExtended>,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        CrossJoinResult<TInput, TExtended>
    > {
        const combinations = (
            await this.makeCollection([
                this.collection,
                this.makeCollection(this.iterable),
            ] as IAsyncCollection<TInput | TExtended>[]).reduce<
                IAsyncCollection<Array<TInput | TExtended>>
            >(
                async (a, b) => {
                    return await a
                        .map((x) => {
                            return b.map((y) => {
                                return [...x, y];
                            });
                        })
                        .reduce<IAsyncCollection<Array<TInput | TExtended>>>(
                            (c, b) => c.append(b),
                            this.makeCollection<Array<TInput | TExtended>>([]),
                        );
                },
                this.makeCollection([[] as Array<TInput | TExtended>]),
            )
        ).map((combination) => {
            // Flatting the array
            return combination.reduce<Array<TInput | TExtended>>((a, b) => {
                return [...a, ...(isIterable(b) ? b : [b])] as Array<
                    TInput | TExtended
                >;
            }, []);
        });

        yield* combinations as AsyncIterable<
            CrossJoinResult<TInput, TExtended>
        >;
    }
}

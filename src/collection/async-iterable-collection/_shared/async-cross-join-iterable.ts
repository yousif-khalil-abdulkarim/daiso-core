import {
    CollectionError,
    CrossJoinResult,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";
import { isIterable } from "@/collection/_module";

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
        try {
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
                            .reduce<
                                IAsyncCollection<Array<TInput | TExtended>>
                            >(
                                (c, b) => c.append(b),
                                this.makeCollection<Array<TInput | TExtended>>(
                                    [],
                                ),
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

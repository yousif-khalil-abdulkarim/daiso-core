import {
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
    TypeCollectionError,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncCrossJoinIterable<TInput, TExtended>
    implements AsyncIterable<IAsyncCollection<TInput | TExtended>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private iterables: Array<AsyncIterableValue<TExtended>>,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<
        IAsyncCollection<TInput | TExtended>
    > {
        try {
            yield* await this.makeCollection<
                IAsyncCollection<TInput | TExtended>
            >([
                this.collection,
                ...this.iterables.map<IAsyncCollection<TExtended>>((iterable) =>
                    this.makeCollection(iterable),
                ),
            ]).reduce<IAsyncCollection<IAsyncCollection<TInput | TExtended>>>({
                reduceFn: (a, b) => {
                    return a
                        .map((x) =>
                            b.map((y) => {
                                return x.append([y]);
                            }),
                        )
                        .reduce<
                            IAsyncCollection<
                                IAsyncCollection<TInput | TExtended>
                            >
                        >({
                            reduceFn: (c, b) => c.append(b),
                            initialValue: this.makeCollection<
                                IAsyncCollection<TInput | TExtended>
                            >([]),
                        });
                },
                initialValue: this.makeCollection<
                    IAsyncCollection<TInput | TExtended>
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

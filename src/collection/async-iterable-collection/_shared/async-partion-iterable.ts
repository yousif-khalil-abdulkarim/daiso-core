import {
    type AsyncPredicate,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncPartionIterable<TInput>
    implements AsyncIterable<IAsyncCollection<TInput>>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<IAsyncCollection<TInput>> {
        try {
            const arrayA: TInput[] = [];
            const arrayB: TInput[] = [];
            for await (const [index, item] of this.collection.entries()) {
                if (await this.predicateFn(item, index, this.collection)) {
                    arrayA.push(item);
                } else {
                    arrayB.push(item);
                }
            }
            yield this.makeCollection(arrayA);
            yield this.makeCollection(arrayB);
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

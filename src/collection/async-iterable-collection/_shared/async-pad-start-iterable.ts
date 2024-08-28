import { type IAsyncCollection } from "@/contracts/collection/_module";
import { type AsyncIterableValue } from "@/_shared/types";

/**
 * @internal
 */
export class AsyncPadStartIterable<TInput, TExtended>
    implements AsyncIterable<TInput | TExtended>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private maxLength: number,
        private fillItems: AsyncIterableValue<TExtended>,
        private makeCollection: <TInput>(
            iterable: AsyncIterableValue<TInput>,
        ) => IAsyncCollection<TInput>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput | TExtended> {
        const fillCollections = this.makeCollection(this.fillItems);
        const fillSize = await fillCollections.size();
        const size = await this.collection.size();
        const repeat = Math.floor((this.maxLength - size) / fillSize);
        let resultCollection: IAsyncCollection<TInput | TExtended> =
            this.makeCollection<TInput | TExtended>([]);
        for (let index = 0; index < repeat; index++) {
            resultCollection = resultCollection.append(fillCollections);
        }
        const restAmount = this.maxLength - (repeat * fillSize + size);
        resultCollection = resultCollection.append(
            fillCollections.slice({
                start: 0,
                end: restAmount,
            }),
        );
        resultCollection = resultCollection.append(this.collection);
        yield* resultCollection;
    }
}

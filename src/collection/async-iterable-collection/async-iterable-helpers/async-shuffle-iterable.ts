import { type IAsyncCollection } from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncShuffleIterable<TInput> implements AsyncIterable<TInput> {
    constructor(private collection: IAsyncCollection<TInput>) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        const newArray = [...(await this.collection.toArray())];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = newArray[i];
            if (newArray[j] !== undefined) {
                newArray[i] = newArray[j];
            }
            if (temp !== undefined) {
                newArray[j] = temp;
            }
        }
        yield* newArray;
    }
}

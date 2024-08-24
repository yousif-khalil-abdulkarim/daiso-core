import { type IAsyncCollection } from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncDelayIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private timeInMs: number,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        let isFirstIteration = true;
        for await (const item of this.collection) {
            if (!isFirstIteration) {
                await new Promise((resolve) =>
                    setTimeout(resolve, this.timeInMs),
                );
            }
            if (isFirstIteration) {
                isFirstIteration = false;
            }
            yield item;
        }
    }
}

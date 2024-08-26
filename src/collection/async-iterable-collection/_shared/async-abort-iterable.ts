import { type IAsyncCollection } from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncAbortIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private signal: AbortSignal,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        let hasAborted = false;
        this.signal.addEventListener("abort", () => {
            hasAborted = true;
        });
        for await (const item of this.collection) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (hasAborted) {
                break;
            }
            yield item;
        }
    }
}

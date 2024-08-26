import { type IAsyncCollection } from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncTimeoutIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private timeInMs: number,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        const abortController = new AbortController();
        const timeout = setTimeout(() => {
            abortController.abort();
        }, this.timeInMs);
        yield* this.collection.abort(abortController.signal);
        clearTimeout(timeout);
    }
}

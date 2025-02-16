/**
 * @module Collection
 */

import {
    type AsyncTap,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports";

/**
 * @internal
 */
export class AsyncTapIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private callback: AsyncTap<IAsyncCollection<TInput>>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        await this.callback(this.collection);
        yield* this.collection;
    }
}

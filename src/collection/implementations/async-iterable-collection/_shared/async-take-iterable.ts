/**
 * @module Collection
 */

import { type IAsyncCollection } from "@/collection/contracts/_module";

/**
 * @internal
 */
export class AsyncTakeIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private limit: number,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        if (this.limit < 0) {
            this.limit = (await this.collection.size()) + this.limit;
        }
        yield* this.collection.takeWhile((_item, index) => index < this.limit);
    }
}

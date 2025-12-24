/**
 * @module Collection
 */

import {
    type AsyncTap,
    type IAsyncCollection,
} from "@/collection/contracts/_module.js";
import { resolveInvokable } from "@/utilities/_module.js";

/**
 * @internal
 */
export class AsyncTapIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private callback: AsyncTap<IAsyncCollection<TInput>>,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        await resolveInvokable(this.callback)(this.collection);
        yield* this.collection;
    }
}

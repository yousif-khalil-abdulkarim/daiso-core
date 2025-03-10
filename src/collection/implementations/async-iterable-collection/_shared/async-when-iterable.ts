/**
 * @module Collection
 */

import {
    type Modifier,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class AsyncWhenIterable<TInput, TExtended>
    implements AsyncIterable<TInput | TExtended>
{
    constructor(
        private collection: IAsyncCollection<TInput>,
        private condition: () => boolean | PromiseLike<boolean>,
        private callback: Modifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput | TExtended> {
        if (await this.condition()) {
            yield* await this.callback(this.collection);
            return;
        }
        yield* this.collection as IAsyncCollection<TInput | TExtended>;
    }
}

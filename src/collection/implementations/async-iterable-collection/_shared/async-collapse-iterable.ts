/**
 * @module Collection
 */

import {
    isAsyncIterable,
    isIterable,
} from "@/collection/implementations/_shared";
import {
    type AsyncCollapse,
    type IAsyncCollection,
} from "@/collection/contracts/_module-exports";

/**
 * @internal
 */
export class AsyncCollapseIterable<TInput>
    implements AsyncIterable<AsyncCollapse<TInput>>
{
    constructor(private collection: IAsyncCollection<TInput>) {}

    async *[Symbol.asyncIterator](): AsyncIterator<AsyncCollapse<TInput>> {
        for await (const item of this.collection) {
            if (isIterable<TInput>(item) || isAsyncIterable<TInput>(item)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                yield* item as any;
            } else {
                yield item as AsyncCollapse<TInput>;
            }
        }
    }
}

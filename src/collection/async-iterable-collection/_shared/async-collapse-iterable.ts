import { isAsyncIterable, isIterable } from "@/collection/_shared";
import {
    type AsyncCollapse,
    CollectionError,
    type IAsyncCollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncCollapseIterable<TInput>
    implements AsyncIterable<AsyncCollapse<TInput>>
{
    constructor(private collection: IAsyncCollection<TInput>) {}

    async *[Symbol.asyncIterator](): AsyncIterator<AsyncCollapse<TInput>> {
        try {
            for await (const item of this.collection) {
                if (isIterable<TInput>(item) || isAsyncIterable<TInput>(item)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    yield* item as any;
                } else {
                    yield item as AsyncCollapse<TInput>;
                }
            }
        } catch (error: unknown) {
            if (error instanceof CollectionError) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

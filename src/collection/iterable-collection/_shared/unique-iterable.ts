import {
    CollectionError,
    type ICollection,
    type Map,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class UniqueIterable<TInput, TOutput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private callback: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            item as any,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            const set = new Set<TOutput>([]);

            for (const [index, item] of this.collection.entries()) {
                const item_ = this.callback(item, index, this.collection);
                if (!set.has(item_)) {
                    yield item;
                }
                set.add(item_);
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

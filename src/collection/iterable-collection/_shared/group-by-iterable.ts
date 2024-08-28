import {
    CollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
    type ICollection,
    type Map,
} from "@/contracts/collection/_module";
import { type RecordItem } from "@/_shared/types";

/**
 * @internal
 */
export class GroupByIterable<TInput, TOutput = TInput>
    implements Iterable<RecordItem<TOutput, ICollection<TInput>>>
{
    constructor(
        private collection: ICollection<TInput>,
        private selectFn: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            item as any,
        private throwOnIndexOverflow: boolean,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<RecordItem<TOutput, ICollection<TInput>>> {
        try {
            const map = new Map<TOutput, ICollection<TInput>>();
            for (const [index, item] of this.collection.entries(
                this.throwOnIndexOverflow,
            )) {
                const key = this.selectFn(item, index, this.collection);
                let collection: ICollection<TInput> | undefined = map.get(key);
                if (collection === undefined) {
                    collection = this.makeCollection<TInput>([]);
                    map.set(key, collection);
                }

                map.set(key, collection.append([item]));
            }
            yield* map;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

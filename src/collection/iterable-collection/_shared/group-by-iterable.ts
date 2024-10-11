import {
    CollectionError,
    UnexpectedCollectionError,
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

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<RecordItem<TOutput, ICollection<TInput>>> {
        try {
            const map = new Map<TOutput, Array<TInput>>();
            for (const [index, item] of this.collection.entries()) {
                const key = this.selectFn(item, index, this.collection);
                let array = map.get(key);
                if (array === undefined) {
                    array = [];
                    map.set(key, array);
                }
                array.push(item);
                map.set(key, array);
            }
            yield* this.makeCollection(map).map<
                RecordItem<TOutput, ICollection<TInput>>
            >(([key, value]) => [key, this.makeCollection(value)]);
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

import {
    CollectionError,
    UnexpectedCollectionError,
    type RecordItem,
} from "@/contracts/collection/_module";

export class ZipIterable<TInput, TExtended>
    implements Iterable<RecordItem<TInput, TExtended>>
{
    constructor(
        private iterableA: Iterable<TInput>,
        private iterableB: Iterable<TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<RecordItem<TInput, TExtended>> {
        try {
            const iteratorA = this.iterableA[Symbol.iterator](),
                iteratorB = this.iterableB[Symbol.iterator]();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            while (true) {
                const itemA = iteratorA.next(),
                    itemB = iteratorB.next();
                if (itemA.done || itemB.done) {
                    break;
                }
                yield [itemA.value, itemB.value];
            }
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
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

import {
    CollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
    type ICollection,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class PadEndIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private maxLength: number,
        private fillItems: Iterable<TExtended>,
        private makeCollection: <TInput>(
            iterable: Iterable<TInput | TExtended>,
        ) => ICollection<TInput | TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        try {
            const fillCollections = this.makeCollection<TInput>(this.fillItems);
            const fillSize = fillCollections.size();
            const size = this.collection.size();
            const repeat = Math.floor((this.maxLength - size) / fillSize);
            let resultCollection: ICollection<TInput | TExtended> =
                this.makeCollection<TInput>([]);
            for (let index = 0; index < repeat; index++) {
                resultCollection = resultCollection.append(fillCollections);
            }
            const restAmount = this.maxLength - (repeat * fillSize + size);
            resultCollection = resultCollection.append(
                fillCollections.slice({
                    start: 0,
                    end: restAmount,
                }),
            );
            resultCollection = resultCollection.prepend(this.collection);
            yield* resultCollection;
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

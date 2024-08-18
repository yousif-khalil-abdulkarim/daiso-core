import { isIterable } from "@/collection/_shared";
import {
    type Collapse,
    CollectionError,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

export class CollapseIterable<TInput> implements Iterable<Collapse<TInput>> {
    constructor(private collection: ICollection<TInput>) {}

    *[Symbol.iterator](): Iterator<Collapse<TInput>> {
        try {
            for (const item of this.collection) {
                if (isIterable<TInput>(item)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    yield* item as any;
                } else {
                    yield item as Collapse<TInput>;
                }
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

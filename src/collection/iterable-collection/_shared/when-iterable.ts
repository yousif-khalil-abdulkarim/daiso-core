import {
    type ICollection,
    type Modifier,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class WhenIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ICollection<TInput>,
        private condition: () => boolean,
        private callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        if (this.condition()) {
            yield* this.callback(this.collection);
            return;
        }
        yield* this.collection as ICollection<TInput | TExtended>;
    }
}

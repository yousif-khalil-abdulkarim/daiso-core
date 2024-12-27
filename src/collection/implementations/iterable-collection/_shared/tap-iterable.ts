import { type ICollection, type Tap } from "@/collection/contracts/_module";

/**
 * @internal
 */
export class TapIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private callback: Tap<ICollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        this.callback(this.collection);
        yield* this.collection;
    }
}

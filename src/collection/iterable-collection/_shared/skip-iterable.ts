import { type ICollection } from "@/contracts/collection/_module";

/**
 * @internal
 */
export class SkipIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private offset: number,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        if (this.offset < 0) {
            this.offset = this.collection.size() + this.offset;
        }
        yield* this.collection.skipWhile((_item, index) => index < this.offset);
    }
}

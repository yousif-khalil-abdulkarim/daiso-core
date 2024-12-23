import {} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class MergeIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private iterableA: Iterable<TInput>,
        private iterableB: Iterable<TExtended>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        yield* this.iterableA;
        yield* this.iterableB;
    }
}

/**
 * @module Collection
 */

/**
 * @internal
 */
export class MergeIterable<TInput> implements Iterable<TInput> {
    constructor(private iterables: Iterable<Iterable<TInput>>) {}

    *[Symbol.iterator](): Iterator<TInput> {
        for (const iterable of this.iterables) {
            yield* iterable;
        }
    }
}

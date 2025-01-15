/**
 * @module Collection
 */

/**
 * @internal
 */
export class EntriesIterable<TInput> implements Iterable<[number, TInput]> {
    constructor(private iterable: Iterable<TInput>) {}

    *[Symbol.iterator](): Iterator<[number, TInput]> {
        let index = 0;
        for (const item of this.iterable) {
            yield [index, item];
            index++;
        }
    }
}

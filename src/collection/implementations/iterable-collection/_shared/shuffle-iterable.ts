/**
 * @module Collection
 */

/**
 * @internal
 */
export class ShuffleIterable<TInput> implements Iterable<TInput> {
    constructor(
        private iterable: Iterable<TInput>,
        private readonly mathRandom: () => number,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        const newArray = [...this.iterable];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(this.mathRandom() * (i + 1));
            const temp = newArray[i];
            if (newArray[j] !== undefined) {
                newArray[i] = newArray[j];
            }
            if (temp !== undefined) {
                newArray[j] = temp;
            }
        }
        yield* newArray;
    }
}

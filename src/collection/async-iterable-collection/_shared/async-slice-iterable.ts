import { type IAsyncCollection } from "@/contracts/collection/_module";

/**
 * @internal
 */
export class AsyncSliceIterable<TInput> implements AsyncIterable<TInput> {
    constructor(
        private collection: IAsyncCollection<TInput>,
        private start: number | undefined,
        private end: number | undefined,
        private throwOnIndexOverflow: boolean,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        const size = await this.collection.size();
        let { start, end } = this;
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = size;
        }
        if (start < 0) {
            start = size + start;
        }
        if (end < 0) {
            end = size + end;
        }
        yield* this.collection.filter((_item, index) => {
            return start <= index && index < end;
        }, this.throwOnIndexOverflow);
    }
}

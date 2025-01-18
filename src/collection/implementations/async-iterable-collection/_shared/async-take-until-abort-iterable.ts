/**
 * @module Collection
 */
import { abort } from "@/async/utilities/abort/_module";

/**
 * @internal
 */
export class AsyncTakeUntilAbortIterable<TValue>
    implements AsyncIterable<TValue>
{
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly abortSignal: AbortSignal,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        let [result] = await abort(() => iterator.next(), this.abortSignal);
        if (result === null) {
            return;
        }
        yield result.value;

        while (!result.done) {
            if (this.abortSignal.aborted) {
                return;
            }
            const [result_] = await abort(
                () => iterator.next(),
                this.abortSignal,
            );
            if (result_ === null) {
                return;
            }
            result = result_;
            if (result.done) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return result.value;
            }
            yield result.value;
        }
    }
}

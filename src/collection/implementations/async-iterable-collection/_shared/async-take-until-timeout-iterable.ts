/**
 * @module Collection
 */

import { type TimeSpan } from "@/utilities/_module";
import { abort } from "@/async/utilities/abort/_module";

/**
 * @internal
 */
export class AsyncTakeUntilTimeoutIterable<TInput>
    implements AsyncIterable<TInput>
{
    constructor(
        private readonly iterable: AsyncIterable<TInput>,
        private readonly time: TimeSpan,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            abortController.abort("");
        }, this.time.toMilliseconds());
        try {
            const iterator = this.iterable[Symbol.asyncIterator]();
            let [result] = await abort(
                () => iterator.next(),
                abortController.signal,
            );
            if (result === null) {
                return;
            }
            yield result.value;

            while (!result.done) {
                if (abortController.signal.aborted) {
                    return;
                }
                const [result_] = await abort(
                    () => iterator.next(),
                    abortController.signal,
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
        } catch {
            return;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

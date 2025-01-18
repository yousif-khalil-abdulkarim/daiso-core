/**
 * @module Collection
 */
import { retry, type RetrySettings } from "@/async/utilities/retry/_module";

/**
 * @internal
 */
export class AsyncRetryIterable<TValue> implements AsyncIterable<TValue> {
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly settings?: RetrySettings,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        let [result] = await retry(() => iterator.next(), this.settings);
        if (result === null) {
            return;
        }
        yield result.value;

        while (!result.done) {
            const [result_] = await retry(() => iterator.next(), this.settings);
            if (result_ === null) {
                continue;
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

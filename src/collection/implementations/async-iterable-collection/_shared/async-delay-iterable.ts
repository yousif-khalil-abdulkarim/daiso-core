/**
 * @module Collection
 */

import type { TimeSpan } from "@/utilities/_module-exports";
import { delay } from "@/async/_module-exports";

/**
 * @internal
 */
export class AsyncDelayIterable<TValue> implements AsyncIterable<TValue> {
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly time: TimeSpan,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        let result = await iterator.next();
        yield result.value;

        while (!result.done) {
            await delay(this.time);
            result = await iterator.next();
            if (result.done) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return result.value;
            }
            yield result.value;
        }
    }
}

/**
 * @module Async
 */

import {
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
} from "@/async/_shared";
import { abortablePromise } from "@/async/abortable/abortable-promise/_module";

/**
 * @internal
 */
class AbortableAsyncIterable<TValue> implements AsyncIterable<TValue> {
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly abortSignal: AbortSignal,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            if (this.abortSignal.aborted) {
                throw new AbortAsyncError(
                    `Promise was aborted with reason of "${String(this.abortSignal.aborted)}"`,
                    this.abortSignal.reason,
                );
            }
            const result = await abortablePromise(
                () => iterator.next(),
                this.abortSignal,
            );
            if (result.done) {
                return;
            }
            yield result.value;
        }
    }
}

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function abortableAsyncIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    abortSignal: AbortSignal,
): AsyncIterable<TValue> {
    return new AbortableAsyncIterable(iterable, abortSignal);
}

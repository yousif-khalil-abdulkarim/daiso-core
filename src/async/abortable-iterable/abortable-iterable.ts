/**
 * @module Async
 */

import {
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
} from "@/async/_shared";
import { abortable } from "@/async/abortable/_module";

/**
 * @internal
 */
class AbortableIterable<TValue> implements AsyncIterable<TValue> {
    constructor(
        private readonly iterable: AsyncIterable<TValue>,
        private readonly abortSignal: AbortSignal,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TValue> {
        const iterator = this.iterable[Symbol.asyncIterator]();
        let result = await abortable(() => iterator.next(), this.abortSignal);
        yield result.value;

        while (!result.done) {
            if (this.abortSignal.aborted) {
                throw new AbortAsyncError(
                    `Promise was aborted with reason of "${String(this.abortSignal.aborted)}"`,
                    this.abortSignal.reason,
                );
            }
            result = await abortable(() => iterator.next(), this.abortSignal);
            if (result.done) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return result.value;
            }
            yield result.value;
        }
    }
}

/**
 * The <i>abortableIterable</i> function makes a <i>{@link AsyncIterable}</i> abortable.
 * @group AsyncIterable utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @example
 * ```ts
 * import { abortableIterable } from "@daiso-tech/core"
 *
 * let a = 0;
 * const abortController = new AbortController();
 * const iterable: AsyncIterable<void> = {
 *  async *[Symbol.asyncIterator]() {
 *    a = 1;
 *    abortController.abort("My abort");
 *    yield undefined;
 *    a = 2;
 *  }
 * }
 * const newIterable = abortableIterable(iterable, abortController.signal);
 * (async () => {
 *  try {
 *    // An error will be thrown
 *    for await (const _ of newIterable);
 *  }
 *  finally {
 *    // Will be 1
 *    console.log(a);
 *  }
 * })();
 * ```
 */
export function abortableIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    abortSignal: AbortSignal,
): AsyncIterable<TValue> {
    return new AbortableIterable(iterable, abortSignal);
}

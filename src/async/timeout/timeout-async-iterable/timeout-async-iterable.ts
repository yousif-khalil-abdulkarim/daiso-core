/**
 * @module Async
 */

import { abortableAsyncIterable } from "@/async/abortable/_module";

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function timeoutAsyncIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    timeInMs: number,
    abortSignal: AbortSignal = new AbortController().signal,
): AsyncIterable<TValue> {
    return abortableAsyncIterable(
        iterable,
        AbortSignal.any([abortSignal, AbortSignal.timeout(timeInMs)]),
    );
}

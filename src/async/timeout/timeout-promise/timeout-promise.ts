/**
 * @module Async
 */

import { abortablePromise } from "@/async/abortable/_module";

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function timeoutPromise<TValue>(
    promise: () => PromiseLike<TValue>,
    timeInMs: number,
    abortSignal: AbortSignal = new AbortController().signal,
): PromiseLike<TValue> {
    return abortablePromise(
        promise,
        AbortSignal.any([abortSignal, AbortSignal.timeout(timeInMs)]),
    );
}

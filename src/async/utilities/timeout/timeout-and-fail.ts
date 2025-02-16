/**
 * @module Async
 */
import { AbortAsyncError, TimeoutAsyncError } from "@/async/async.errors.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import { abortAndFail } from "@/async/utilities/abort/_module.js";

/**
 * @internal
 */
export async function timeoutAndFail<TValue>(
    asyncFn: () => PromiseLike<TValue>,
    time: TimeSpan,
): Promise<TValue> {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
        timeoutController.abort(
            new TimeoutAsyncError("The promise exceded time"),
        );
    }, time.toMilliseconds());
    try {
        return await abortAndFail(asyncFn, timeoutController.signal);
    } catch (error: unknown) {
        if (
            error instanceof AbortAsyncError &&
            error.cause instanceof TimeoutAsyncError
        ) {
            throw error.cause;
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

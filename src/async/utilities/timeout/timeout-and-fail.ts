/**
 * @module Async
 */
import { AbortAsyncError, TimeoutAsyncError } from "@/async/async.errors";
import type { TimeSpan } from "@/utilities/_module-exports";
import { abortAndFail } from "@/async/utilities/abort/_module";

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

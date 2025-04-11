import { TimeoutAsyncError } from "@/async/async.errors.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import { abortAndFail } from "@/async/utilities/abort-and-fail/_module.js";

/**
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 *
 * @internal
 */
export async function timeoutAndFail<TValue>(
    promise: PromiseLike<TValue>,
    time: TimeSpan,
    abort: (rejection: unknown) => void,
    signal: AbortSignal,
): Promise<TValue> {
    const timeoutId = setTimeout(() => {
        abort(new TimeoutAsyncError("The promise exceded time"));
    }, time.toMilliseconds());
    try {
        return await abortAndFail(promise, signal);
    } finally {
        clearTimeout(timeoutId);
    }
}

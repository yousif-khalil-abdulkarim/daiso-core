/**
 * @module Async
 */
import { TimeoutAsyncError } from "@/async/async.errors.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { Result } from "@/utilities/_module-exports.js";
import { timeoutAndFail } from "@/async/utilities/timeout/timeout-and-fail.js";

/**
 * @internal
 */
export async function timeout<TValue>(
    asyncFn: () => PromiseLike<TValue>,
    time: TimeSpan,
): Promise<Result<TValue, TimeoutAsyncError>> {
    try {
        const value = await timeoutAndFail(asyncFn, time);
        return [value, null];
    } catch (error: unknown) {
        if (error instanceof TimeoutAsyncError) {
            return [null, error];
        }
        throw error;
    }
}

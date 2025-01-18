/**
 * @module Async
 */
import { TimeoutAsyncError } from "@/async/async.errors";
import type { TimeSpan } from "@/utilities/_module";
import type { Result } from "@/utilities/types";
import { timeoutAndFail } from "@/async/utilities/timeout/timeout-and-fail";

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

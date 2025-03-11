/**
 * @module Async
 */
import type { Result } from "@/utilities/_module-exports.js";
import { AbortAsyncError } from "@/async/async.errors.js";
import { abortAndFail } from "@/async/utilities/abort/abort-and-fail.js";

/**
 * @internal
 */
export async function abort<TValue>(
    asyncFn: () => PromiseLike<TValue>,
    abortSignal: AbortSignal,
): Promise<Result<TValue, AbortAsyncError>> {
    try {
        const value = await abortAndFail(asyncFn, abortSignal);
        return [value, null];
    } catch (error: unknown) {
        if (error instanceof AbortAsyncError) {
            return [null, error];
        }
        throw error;
    }
}

/**
 * @module Async
 */

import { RetryAsyncError } from "@/async/async.errors.js";
import type { Result } from "@/utilities/_module-exports.js";
import type { RetrySettings } from "@/async/utilities/retry/retry-or-fail.js";
import { retryOrFail } from "@/async/utilities/retry/retry-or-fail.js";

/**
 * @internal
 */
export async function retry<TValue = void>(
    asyncFn: (attempt: number) => PromiseLike<TValue>,
    settings: RetrySettings = {},
): Promise<Result<TValue, RetryAsyncError>> {
    try {
        const value = await retryOrFail(asyncFn, settings);
        return [value, null];
    } catch (error: unknown) {
        if (error instanceof RetryAsyncError) {
            return [null, error];
        }
        throw error;
    }
}

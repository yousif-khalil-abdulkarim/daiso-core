/**
 * @module Async
 */

import { RetryAsyncError } from "@/async/async.errors";
import type { Result } from "@/utilities/types";
import type { RetrySettings } from "@/async/utilities/retry/retry-or-fail";
import { retryOrFail } from "@/async/utilities/retry/retry-or-fail";

/**
 * @internal
 */
export async function retry<TValue = void>(
    asyncFn: () => PromiseLike<TValue>,
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

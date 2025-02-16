/**
 * @module Async
 */

import { delay } from "@/async/utilities/delay/_module";
import { AbortAsyncError, RetryAsyncError } from "@/async/async.errors";
import { exponentialBackoffPolicy } from "@/async/backof-policies/_module";
import { TimeSpan } from "@/utilities/_module-exports";
import type { BackoffPolicy } from "@/async/backof-policies/_module";

/**
 * @group Utilities
 */
export type RetryPolicy = (error: unknown) => boolean;

/**
 * @group Utilities
 */
export type RetrySettings = {
    /**
     * @default {4}
     */
    maxAttempts?: number;
    backoffPolicy?: BackoffPolicy;
    retryPolicy?: RetryPolicy;
};

/**
 * @internal
 */
export async function retryOrFail<TValue = void>(
    asyncFn: () => PromiseLike<TValue>,
    settings: RetrySettings = {},
): Promise<TValue> {
    const {
        maxAttempts = 4,
        backoffPolicy = exponentialBackoffPolicy(),
        retryPolicy = () => true,
    } = settings;
    let error_: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await asyncFn();
        } catch (error: unknown) {
            error_ = error;
            if (error instanceof AbortAsyncError) {
                throw error;
            }
            if (!retryPolicy(error)) {
                throw error;
            }
            const time = backoffPolicy(attempt, error);
            await delay(TimeSpan.fromMilliseconds(time));
        }
    }

    let errorMessage = `Promise was failed after retried ${String(maxAttempts)} times`;
    if (error_) {
        errorMessage = `${errorMessage} and last thrown error was "${String(error_ as unknown)}"`;
    }
    throw new RetryAsyncError(errorMessage, {
        cause: error_,
        maxAttempts,
    });
}

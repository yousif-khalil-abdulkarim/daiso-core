/**
 * @module Async
 */

import { delay } from "@/async/delay/delay";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnexpectedAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    RetryAsyncError,
} from "@/async/_shared";
import {
    exponentialBackoffPolicy,
    type BackoffPolicy,
} from "@/async/backof-policies";

export type RetryPolicy = (error: unknown) => boolean;
export type RetrySettings = {
    maxAttempts?: number;
    abortSignal?: AbortSignal;
    backoffPolicy?: BackoffPolicy;
    retryPolicy?: RetryPolicy;
};

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {UnexpectedAsyncError} {@link UnexpectedAsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export async function retry<TValue = void>(
    fn: () => Promise<TValue>,
    {
        maxAttempts = 4,
        backoffPolicy = exponentialBackoffPolicy(),
        retryPolicy = () => true,
        abortSignal,
    }: RetrySettings,
): Promise<TValue> {
    let error_: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (abortSignal?.aborted) {
            throw new AbortAsyncError("!!__message__!!", abortSignal.reason);
        }
        try {
            return await fn();
        } catch (error: unknown) {
            error_ = error;
            if (!retryPolicy(error)) {
                break;
            }
            const timeInMs = backoffPolicy(attempt, error);
            await delay(timeInMs, {
                abortSignal,
            });
        }
    }
    throw new RetryAsyncError("!!__message__!!", error_);
}

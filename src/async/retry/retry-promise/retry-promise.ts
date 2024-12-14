/**
 * @module Async
 */

import { delayPromise } from "@/async/delay/delay-promise/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    RetryAsyncError,
} from "@/async/_shared";
import type { BackoffPolicy } from "@/async/backof-policies/_module";
import { exponentialBackoffPolicy } from "@/async/backof-policies/_module";
import { lazyPromise } from "@/async/lazy-promise/lazy-promise";
import { timeoutPromise } from "@/_module";

export type RetryPolicy = (error: unknown) => boolean;
export type RetrySettings = {
    /**
     * @default {4}
     */
    maxAttempts?: number;
    backoffPolicy?: BackoffPolicy;
    retryPolicy?: RetryPolicy;
    /**
     * @default {60_000}
     */
    retryTimeoutInMs?: number;
    abortSignal?: AbortSignal;
};

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function retryPromise<TValue = void>(
    fn: () => PromiseLike<TValue>,
    {
        maxAttempts = 4,
        backoffPolicy = exponentialBackoffPolicy(),
        retryPolicy = () => true,
        retryTimeoutInMs = 60_000,
        abortSignal = new AbortController().signal,
    }: RetrySettings = {},
): PromiseLike<TValue> {
    return lazyPromise(async () => {
        let error_: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            if (abortSignal.aborted) {
                throw new AbortAsyncError(
                    `Promise was aborted with reason of "${String(abortSignal.aborted)}"`,
                    abortSignal.reason,
                );
            }
            try {
                return await timeoutPromise(fn, retryTimeoutInMs, abortSignal);
            } catch (error: unknown) {
                error_ = error;
                if (!retryPolicy(error)) {
                    break;
                }
                const timeInMs = backoffPolicy(attempt, error);
                await delayPromise(timeInMs, abortSignal);
            }
        }

        let errorMessage = `Promise was failed after retried ${String(maxAttempts)}`;
        if (error_) {
            errorMessage = `${errorMessage} and last thrown error was "${String(error_ as unknown)}"`;
        }
        throw new RetryAsyncError(errorMessage, {
            cause: error_,
            maxAttempts,
        });
    });
}

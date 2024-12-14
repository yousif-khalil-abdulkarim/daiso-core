/**
 * @module Async
 */

import { delay } from "@/async/delay/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    RetryAsyncError,
} from "@/async/_shared";
import type { BackoffPolicy } from "@/async/backof-policies/_module";
import { exponentialBackoffPolicy } from "@/async/backof-policies/_module";
import type { LazyPromise } from "@/async/lazy-promise/_module";
import { lazyPromise } from "@/async/lazy-promise/_module";
import { timeout } from "@/async/timeout/_module";
import { TimeSpan } from "@/utilities/_module";

export type RetryPolicy = (error: unknown) => boolean;
export type RetrySettings = {
    /**
     * @default {4}
     */
    maxAttempts?: number;
    backoffPolicy?: BackoffPolicy;
    retryPolicy?: RetryPolicy;
    /**
     * @default 60_000 milliseconds
     */
    retryTimeout?: TimeSpan;
    abortSignal?: AbortSignal;
};

/**
 * The <i>retry</i> function will retry a async function if it throws an error until given <i>settings.maxAttempts</i>.
 * You can add timeout for each retry by passing <i>settings.retryTimeout</i> and <i>settings.abortSignal</i> for aborting it on your own.
 * You can also customize the retry policy by passing <i>settings.retryPolicy</i> and custom backof policy by passing <i>settings.backoffPolicy</i>.
 * @group Promise utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @throws {RetryAsyncError} {@link RetryAsyncError}
 */
export function retry<TValue = void>(
    asyncFn: () => PromiseLike<TValue>,
    settings: RetrySettings = {},
): LazyPromise<TValue> {
    const {
        maxAttempts = 4,
        backoffPolicy = exponentialBackoffPolicy(),
        retryPolicy = () => true,
        retryTimeout = TimeSpan.fromMilliseconds(60_000),
        abortSignal = new AbortController().signal,
    } = settings;
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
                return await timeout(asyncFn, retryTimeout, abortSignal);
            } catch (error: unknown) {
                error_ = error;
                if (!retryPolicy(error)) {
                    break;
                }
                const time = backoffPolicy(attempt, error);
                await delay(TimeSpan.fromMilliseconds(time), abortSignal);
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
    });
}

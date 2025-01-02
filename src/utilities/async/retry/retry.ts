/**
 * @module Utilities
 */

import { delay } from "@/utilities/async/delay/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutAsyncError,
    RetryAsyncError,
} from "@/utilities/async/_shared";
import type { BackoffPolicy } from "@/utilities/backof-policies/_module";
import { exponentialBackoffPolicy } from "@/utilities/backof-policies/_module";
import { LazyPromise } from "@/utilities/async/lazy-promise/_module";
import { timeout } from "@/utilities/async/timeout/_module";
import { TimeSpan } from "@/utilities/_module";

/**
 * @group Async utilities
 */
export type RetryPolicy = (error: unknown) => boolean;

/**
 * @group Async utilities
 */
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
 * @group Async utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 * @throws {RetryAsyncError} {@link RetryAsyncError}
 * @example
 * ```ts
 * import { retry, TimeSpan, exponentialBackoffPolicy } from "@daiso-tech/core";
 *
 * (async () => {
 *   // Will throw RetryAsyncError after failing 4:th attempt
 *   await retry(async () => {
 *     throw new Error("My error mesasge");
 *   }, {
 *     // You can choose the max retry attempts
 *     maxAttempts: 4,
 *     // You can provide a custom backoff policy
 *     backoffPolicy: exponentialBackoffPolicy(),
 *     // You can choose what error to retry, this function will retry all errors thrown
 *     retryPolicy: () => true,
 *     // You can provide a timeout for each retry
 *     retryTimeout: TimeSpan.fromMilliseconds(60_000),
 *   });
 * })();
 * ```
 * @example with abortSignal
 * ```ts
 * import { retry, TimeSpan } from "@daiso-tech/core";
 *
 * (async () => {
 *   const abortController = new AbortController();
 *   abortController.abort("My abort message");
 *
 *   // Will be aborted by throwing AbortAsyncError
 *   await retry(async () => {
 *     throw new Error("My error message");
 *   }, {
 *     abortSignal: abortController.signal
 *   });
 * })();
 * ```
 * @example with custom retry policy
 * ```ts
 * import { retry, TimeSpan } from "@daiso-tech/core";
 *
 * class ErrorA extends Error {};
 * class ErrorB extends Error {};
 *
 * (async () => {
 *   // Will not retry and ErrorB will be thrown
 *   await retry(async () => {
 *     throw new ErrorB("My error message");
 *   }, {
 *     retryPolicy: error => error instanceof ErrorA
 *   });
 * })();
 * ```
 */
export function retry<TValue = void>(
    asyncFn: () => PromiseLike<TValue>,
    settings: RetrySettings = {},
): LazyPromise<TValue> {
    return new LazyPromise(async () => {
        const {
            maxAttempts = 4,
            backoffPolicy = exponentialBackoffPolicy(),
            retryPolicy = () => true,
            retryTimeout = TimeSpan.fromMilliseconds(60_000),
            abortSignal = new AbortController().signal,
        } = settings;
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
                if (error instanceof AbortAsyncError) {
                    throw error;
                }
                if (!retryPolicy(error)) {
                    throw error;
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

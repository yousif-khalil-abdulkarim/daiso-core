/**
 * @module Async
 */

import {
    callInvokable,
    TimeSpan,
    type AsyncMiddleware,
    type Invokable,
    type HookContext,
} from "@/utilities/_module-exports.js";
import {
    exponentialBackoffPolicy,
    type BackoffPolicy,
} from "@/async/backof-policies/_module.js";
import { AbortAsyncError, RetryAsyncError } from "@/async/async.errors.js";
import { LazyPromise } from "@/async/utilities/_module.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type OnExecutionAttemptData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    attempt: number;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type OnExecutionAttempt<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnExecutionAttemptData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type OnRetryData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    error: unknown;
    attempt: number;
    time: TimeSpan;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type OnRetry<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnRetryData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type RetryPolicy = Invokable<[error: unknown, attempt: number], boolean>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type RetryMiddlewareSettings<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    /**
     * You can decide maximal times you can retry.
     * @default {4}
     */
    maxAttempts?: number;

    /**
     * @default
     * ```ts
     * import { exponentialBackoffPolicy } from "@daiso-tech/core/async";
     *
     * exponentialBackoffPolicy();
     * ```
     */
    backoffPolicy?: BackoffPolicy;

    /**
     * You can choose what errors you want to retry. By default all erros will be retried.
     *
     * @default
     * ```ts
     * () => true
     * ```
     */
    retryPolicy?: RetryPolicy;

    /**
     * Callback function that will be called before execution attempt.
     */
    onExecutionAttempt?: OnExecutionAttempt<TParameters, TContext>;

    /**
     * Callback function that will be called when the retry delay starts.
     */
    onRetryStart?: OnRetry<TParameters, TContext>;

    /**
     * Callback function that will be called when the retry delay ends and before the next execution attempt.
     */
    onRetryEnd?: OnRetry<TParameters, TContext>;
};

/**
 * The <i>retryMiddleware</i> enables automatic retries for all errors or specific errors, with configurable backoff policies.
 * An error will be thrown when all retry attempts fail.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 *
 * @example
 * ```ts
 * import { retryMiddleware } from "@daiso-tech/core/async";
 * import { AsyncHooks } from "@daiso-tech/core/utilities";
 *
 * await new AsyncHooks(async (url: string) => {
 *   const response = await fetch(url);
 *   const json = await response.json();
 *   if (!response.ok) {
 *     throw json
 *   }
 *   return json;
 * }, retryMiddleware({ maxAttempts: 8 })).invoke("URL_ENDPOINT");
 * ```
 *
 * @example
 * ```ts
 * import { LazyPromise, retryMiddleware } from "@daiso-tech/core/async";
 *
 * await new LazyPromise(() => {
 *   const response = await fetch("URL_ENDPOINT");
 *   const json = await response.json();
 *   if (!response.ok) {
 *     throw json
 *   }
 *   return json;
 * })
 * .pipe(retryMiddleware({ maxAttempts: 8 }));
 * ```
 */
export function retryMiddleware<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: RetryMiddlewareSettings<TParameters, TContext> = {},
): AsyncMiddleware<TParameters, TReturn, TContext> {
    const {
        maxAttempts = 4,
        backoffPolicy = exponentialBackoffPolicy(),
        retryPolicy = () => true,
        onRetryStart = () => {},
        onRetryEnd = () => {},
        onExecutionAttempt = () => {},
    } = settings;
    return async (args, next, context) => {
        const errors: unknown[] = [];
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                callInvokable(onExecutionAttempt, { attempt, args, context });
                return await next(...args);
            } catch (error: unknown) {
                const time = TimeSpan.fromMilliseconds(
                    callInvokable(backoffPolicy, attempt, error),
                );
                callInvokable(onRetryStart, {
                    error,
                    time,
                    attempt,
                    args,
                    context,
                });

                errors.push(error);
                if (error instanceof AbortAsyncError) {
                    throw error;
                }
                if (!callInvokable(retryPolicy, error, attempt)) {
                    throw error;
                }
                await LazyPromise.delay(time);

                callInvokable(onRetryEnd, {
                    error,
                    time,
                    attempt,
                    args,
                    context,
                });
            }
        }

        let errorMessage = `Promise was failed after retried ${String(maxAttempts)} times`;
        const lastError = errors[errors.length - 1];
        if (lastError) {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            errorMessage = `${errorMessage} and last thrown error was "${String(lastError)}"`;
        }
        throw new RetryAsyncError(errorMessage, {
            errors,
            maxAttempts,
        });
    };
}

/**
 * @module Async
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    callInvokable,
    type Invokable,
    type HookContext,
    type AsyncMiddlewareFn,
} from "@/utilities/_module-exports.js";
import {
    exponentialBackoffPolicy,
    type BackoffPolicy,
} from "@/async/backof-policies/_module.js";
import { RetryAsyncError } from "@/async/async.errors.js";
import { LazyPromise } from "@/async/utilities/_module.js";
import { type ErrorPolicy } from "@/async/middlewares/_shared.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnRetryAttemptData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    attempt: number;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnRetryAttempt<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnRetryAttemptData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnRetryDelayData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    error: unknown;
    attempt: number;
    waitTime: TimeSpan;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnRetryDelay<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnRetryDelayData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type RetryCallbacks<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback {@link Invokable | `Invokable`} that will be called before execution attempt.
     */
    onExecutionAttempt?: OnRetryAttempt<TParameters, TContext>;

    /**
     * Callback {@link Invokable | `Invokable`} that will be called before the retry delay starts.
     */
    onRetryDelay?: OnRetryDelay<TParameters, TContext>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type RetrySettings<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = RetryCallbacks<TParameters, TContext> & {
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
     * (_error: unknown) => true
     * ```
     */
    errorPolicy?: ErrorPolicy;
};

/**
 * The `retry` middleware enables automatic retries for all errors or specific errors, with configurable backoff policies.
 * An error will be thrown when all retry attempts fail.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 * @throws {RetryAsyncError} {@link RetryAsyncError}
 *
 * @example
 * ```ts
 * import { retry } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";
 *
 * const data = await new AsyncHooks(
 *   async (url: string, signal?: AbortSignal): Promise<unknown> => {
 *     const response = await fetch(url, { signal });
 *     return await response.json();
 *   },
 *   [retry()],
 *   {
 *     signalBinder: {
 *       getSignal: (args) => args[1],
 *       forwardSignal: (args, signal) => {
 *         args[1] = signal;
 *       }
 *     }
 *   }
 * )
 * .invoke("URL");
 * ```
 */
export function retry<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<RetrySettings<TParameters, TContext>> = {},
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        maxAttempts = 4,
        backoffPolicy = exponentialBackoffPolicy(),
        errorPolicy = () => true,
        onRetryDelay = () => {},
        onExecutionAttempt = () => {},
    } = settings;
    return async (args, next, { context, signal }) => {
        const errors: unknown[] = [];
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                callInvokable(onExecutionAttempt, { attempt, args, context });
                return await next(...args);
            } catch (error: unknown) {
                if (signal.aborted) {
                    break;
                }

                if (callInvokable(errorPolicy, error)) {
                    errors.push(error);
                } else {
                    throw error;
                }

                const waitTime = callInvokable(backoffPolicy, attempt, error);

                callInvokable(onRetryDelay, {
                    error,
                    waitTime,
                    attempt,
                    args,
                    context,
                });
                await LazyPromise.delay(waitTime, signal);
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

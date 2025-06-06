/**
 * @module Async
 */

import type { Option } from "@/utilities/_module-exports.js";
import {
    type HookContext,
    type AsyncMiddlewareFn,
    callInvokable,
    optionNone,
    optionSome,
    OPTION,
    isResult,
} from "@/utilities/_module-exports.js";
import { exponentialBackoffPolicy } from "@/async/backof-policies/_module.js";
import type { RetrySettings } from "@/async/middlewares/retry/retry.types.js";
import { callErrorPolicy } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/utilities/lazy-promise/_module.js";

/**
 * The `retry` middleware enables automatic retries for all errors or specific errors, with configurable backoff policies.
 * An error will be thrown when all retry attempts fail.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 * @example
 * ```ts
 * import { retry } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";
 *
 * const data = await new AsyncHooks(
 *   async (url: string, signal?: AbortSignal): Promise<unknown> => {
 *     const response = await fetch(url, { signal });
 *     const json = await response.json();
 *     if (!response.ok) {
 *       return json;
 *     }
 *     return json;
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
 *
 * The middleware works also when the function returns a {@link Result | `Result`} type.
 * @example
 * ```ts
 * import { retry } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan, Result, resultFailure, resultSuccess } from "@daiso-tech/core/utilities";
 *
 * const data = await new AsyncHooks(
 *   async (url: string, signal?: AbortSignal): Promise<Result> => {
 *     const response = await fetch(url, { signal });
 *     const json = await response.json();
 *     if (!response.ok) {
 *       return resultFailure(json);
 *     }
 *     return resultSuccess(json);
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
    settings: NoInfer<RetrySettings<TParameters, TContext, TReturn>> = {},
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        maxAttempts = 4,
        backoffPolicy = exponentialBackoffPolicy(),
        errorPolicy,
        onRetryDelay = () => {},
        onExecutionAttempt = () => {},
    } = settings;
    return async (args, next, { context, signal }) => {
        let result: Option<TReturn> = optionNone();
        let error_: Option = optionNone();
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                callInvokable(onExecutionAttempt, { attempt, args, context });
                const value = await next(...args);

                // Handle retrying if an Result type is returned
                result = optionSome(value);
                if (
                    !isResult(value) ||
                    value.type === "success" ||
                    !(await callErrorPolicy<any>(errorPolicy, value))
                ) {
                    return value;
                }

                if (signal.aborted) {
                    break;
                }

                const waitTime = callInvokable(
                    backoffPolicy,
                    attempt,
                    value.error,
                );

                callInvokable(onRetryDelay, {
                    error: value.error,
                    waitTime,
                    attempt,
                    args,
                    context,
                });
                await LazyPromise.delay(waitTime, signal);

                // Handle retrying if an error is thrown
            } catch (error: unknown) {
                if (signal.aborted) {
                    break;
                }

                if (await callErrorPolicy<any>(errorPolicy, error)) {
                    error_ = optionSome(error);
                } else {
                    throw error;
                }

                const waitTime = callInvokable(backoffPolicy, attempt, error);

                callInvokable(onRetryDelay, {
                    error: error,
                    waitTime,
                    attempt,
                    args,
                    context,
                });
                await LazyPromise.delay(waitTime, signal);
            }
        }

        if (error_.type === OPTION.SOME) {
            throw error_.value;
        }
        if (result.type === OPTION.SOME) {
            return result.value;
        }
        throw new Error("!!__MESSAGE__!!");
    };
}

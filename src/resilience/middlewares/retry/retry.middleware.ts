/**
 * @module Resilience
 */

import type { Option, ResultFailure } from "@/utilities/_module-exports.js";
import {
    callInvokable,
    optionNone,
    optionSome,
    OPTION,
    UnexpectedError,
} from "@/utilities/_module-exports.js";
import { exponentialBackoffPolicy } from "@/backoff-policies/_module-exports.js";
import type { RetrySettings } from "@/resilience/middlewares/retry/retry.types.js";
import {
    callErrorPolicyOnThrow,
    callErrorPolicyOnValue,
} from "@/utilities/_module-exports.js";
import { Task } from "@/task/_module-exports.js";
import type {
    AsyncMiddlewareFn,
    HookContext,
} from "@/hooks/_module-exports.js";
import { RetryResilienceError } from "@/resilience/resilience.errors.js";

/**
 * The `retry` middleware enables automatic retries for all errors or specific errors, with configurable backoff policies.
 * An error will be thrown when all retry attempts fail.
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Middleware
 *
 * @example
 * ```ts
 * import { retry } from "@daiso-tech/core/resilience";
 * import { AsyncHooks } from "@daiso-tech/core/hooks";
 * import { TimeSpan } from "@daiso-tech/core/time-span";
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
 * import { retry } from "@daiso-tech/core/resilience";
 * import { Result, resultFailure, resultSuccess } from "@daiso-tech/core/utilities";
 * import { AsyncHooks } from "@daiso-tech/core/hooks";
 * import { TimeSpan } from "@daiso-tech/core/time-span";
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
        const allErrors: unknown[] = [];
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                callInvokable(onExecutionAttempt, { attempt, args, context });
                const value = await next(...args);

                // Handle retrying if an Result type is returned
                result = optionSome(value);
                if (!(await callErrorPolicyOnValue(errorPolicy, value))) {
                    return value;
                }
                // We can cast type here because callErrorPolicyOnValue ensures the value is a ResultFailure
                const resultFailure = value as ResultFailure;

                if (signal.aborted) {
                    break;
                }

                const waitTime = callInvokable(
                    backoffPolicy,
                    attempt,
                    resultFailure.error,
                );

                callInvokable(onRetryDelay, {
                    error: resultFailure.error,
                    waitTime,
                    attempt,
                    args,
                    context,
                });
                await Task.delay(waitTime, signal);

                // Handle retrying if an error is thrown
            } catch (error: unknown) {
                if (signal.aborted) {
                    break;
                }

                if (await callErrorPolicyOnThrow<any>(errorPolicy, error)) {
                    allErrors.push(error);
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
                await Task.delay(waitTime, signal);
            }
        }

        if (allErrors.length !== 0) {
            throw new RetryResilienceError(allErrors, "!!__MESSAGE__!!");
        }
        if (result.type === OPTION.SOME) {
            return result.value;
        }
        throw new UnexpectedError("!!__MESSAGE__!!");
    };
}

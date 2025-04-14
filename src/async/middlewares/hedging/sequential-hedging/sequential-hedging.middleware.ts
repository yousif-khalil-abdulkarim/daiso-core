/**
 * @module Async
 */

import {
    callInvokable,
    isInvokable,
    resolveOneOrMore,
    TimeSpan,
    type AsyncMiddlewareFn,
    type HookContext,
} from "@/utilities/_module-exports.js";
import type {
    HedgingSettings,
    NamedFallback,
} from "@/async/middlewares/hedging/_shared.js";
import { HedgingAsyncError } from "@/async/async.errors.js";
import { timeoutAndFail } from "@/async/utilities/_module.js";

/**
 * The `sequentialHedging` middleware executes the primary function and all fallback functions sequentially.
 * It returns the result of the first successful function and automatically cancels all remaining functions.
 * If all function fail than error is thrown.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 * @throws {HedgingAsyncError} {@link HedgingAsyncError}
 *
 * @example
 * ```ts
 * import { sequentialHedging } from "@daiso-tech/core/async";
 * import { AsyncHooks } from "@daiso-tech/core/utilities";
 *
 * async function fn1(signal?: AbortSignal): Promise<unknown> {
 *   const response = await fetch("ENDPOINT-1", { signal });
 *   return await response.json();
 * }
 * async function fn2(signal?: AbortSignal): Promise<unknown> {
 *   const response = await fetch("ENDPOINT-2", { signal });
 *   return await response.json();
 * }
 * async function fn3(signal?: AbortSignal): Promise<unknown> {
 *   const response = await fetch("ENDPOINT-3", { signal });
 *   return await response.json();
 * }
 * const fetchData = new AsyncHooks(fn1, [
 *   sequentialHedging({
 *     fallbacks: [
 *       fn2,
 *       fn3
 *     ]
 *   })
 * ], {
 *   signalBinder: {
 *     getSignal: (args) => args[0],
 *     forwardSignal: (args, signal) => {
 *       args[0] = signal;
 *     }
 *   }
 * });
 *
 * console.log(await fetchData.invoke());
 * ```
 */
export function sequentialHedging<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<HedgingSettings<TParameters, TReturn, TContext>>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        waitTime = TimeSpan.fromSeconds(2),
        fallbacks,
        onHedgeAttempt = () => {},
        onHedgeError = () => {},
    } = settings;

    const resolvedFallbacks = resolveOneOrMore(fallbacks).map<
        NamedFallback<TParameters, TReturn>
    >((fallback, index) => {
        if (isInvokable(fallback)) {
            return {
                name: `fallback-${String(index + 1)}`,
                func: fallback,
            };
        }
        return fallback;
    });

    return async (args, next, { context, signal, abort }) => {
        const errors: unknown[] = [];
        const funcs = [
            {
                name: "__initial",
                func: next,
            },
            ...resolvedFallbacks,
        ];
        for (const { name, func } of funcs) {
            try {
                callInvokable(onHedgeAttempt, {
                    args,
                    context,
                    name,
                });
                return await timeoutAndFail(
                    (async () => callInvokable(func, ...args))(),
                    waitTime,
                    (error: unknown) => {
                        abort(error);
                    },
                    signal,
                );
            } catch (error: unknown) {
                if (signal.aborted) {
                    break;
                }
                callInvokable(onHedgeError, {
                    args,
                    context,
                    error,
                    name,
                });
                errors.push(error);
            }
        }

        // If all promiseResults are rejected we will throw an error
        const funcNames = funcs
            .slice(1)
            .map(({ name }) => `"${name}"`)
            .join(", ");
        throw new HedgingAsyncError(
            `The original function and fallback functions failed: ${funcNames}`,
            errors,
        );
    };
}

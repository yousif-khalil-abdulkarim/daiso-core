/**
 * @module Async
 */

import {
    AsyncHooks,
    callErrorPolicyOnThrow,
    callErrorPolicyOnValue,
    callInvokable,
    isInvokable,
    optionNone,
    optionSome,
    resolveOneOrMore,
    UnexpectedError,
    type AbortSignalBinder,
    type AsyncMiddleware,
    type AsyncMiddlewareFn,
    type HookContext,
    type OneOrMore,
    type Option,
    type ResultFailure,
} from "@/utilities/_module-exports.js";
import {
    type Fallback,
    type HedgingSettings,
    type NamedFallback,
} from "@/async/middlewares/hedging/hedging.types.js";

/**
 * @internal
 */
function resolveFunctions<TParameters extends unknown[], TReturn>(
    primaryFn: Fallback<TParameters, TReturn>,
    fallbacks: OneOrMore<
        Fallback<TParameters, TReturn> | NamedFallback<TParameters, TReturn>
    >,
    middlewares: OneOrMore<AsyncMiddleware<TParameters, TReturn>>,
    signalBinder: AbortSignalBinder<TParameters>,
): NamedFallback<TParameters, TReturn>[] {
    const resolvedFallbacks = resolveOneOrMore(fallbacks).map<
        NamedFallback<TParameters, TReturn>
    >((fallback, index) => {
        if (isInvokable(fallback)) {
            return {
                name: `fallback-${String(index + 1)}`,
                invokable: fallback,
            };
        }
        return fallback;
    });
    return [
        {
            name: "__primary",
            invokable: primaryFn,
        },
        ...resolvedFallbacks,
    ].map((namedFn) => ({
        name: namedFn.name,
        invokable: new AsyncHooks(namedFn.invokable, middlewares, {
            signalBinder,
        }),
    }));
}

/**
 * The `sequentialHedging` middleware executes the primary function and all fallback functions sequentially.
 * It returns the result of the first successful function and automatically cancels all remaining functions.
 * If all function fail than last error is thrown.
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
        middlewares = [],
        fallbacks,
        errorPolicy,
        onHedgingAttempt = () => {},
        onHedgingError = () => {},
    } = settings;
    return async (args, next, { context, signal, signalBinder }) => {
        const funcs = resolveFunctions(
            next,
            fallbacks,
            middlewares,
            signalBinder,
        );
        let lastError: Option = optionNone();
        for (const { name, invokable: func } of funcs) {
            try {
                if (signal.aborted) {
                    break;
                }

                callInvokable(onHedgingAttempt, {
                    args,
                    context,
                    name,
                });
                const value = await callInvokable(func, ...args);

                // Handle hedging if an Result type is returned
                if (!(await callErrorPolicyOnValue(errorPolicy, value))) {
                    return value;
                }

                // We can cast type here because callErrorPolicyOnValue ensures the value is a ResultFailure
                const resultFailure = value as ResultFailure;

                callInvokable(onHedgingError, {
                    args,
                    context,
                    error: resultFailure.error,
                    name,
                });
                lastError = optionSome(resultFailure.error);

                // Handle hedging if an error is thrown
            } catch (error: unknown) {
                if (signal.aborted) {
                    break;
                }

                if (await callErrorPolicyOnThrow<any>(errorPolicy, error)) {
                    lastError = optionSome(error);
                } else {
                    throw error;
                }

                callInvokable(onHedgingError, {
                    args,
                    context,
                    error,
                    name,
                });
                lastError = optionSome(error);
            }
        }

        if (lastError.type === "none") {
            throw new UnexpectedError("!!__MESSAGE__!!");
        }

        throw lastError.value;
    };
}

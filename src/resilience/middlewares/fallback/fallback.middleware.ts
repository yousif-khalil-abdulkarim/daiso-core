/**
 * @module Async
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type Result,
    resolveAsyncLazyable,
    callInvokable,
    resultSuccess,
    callErrorPolicyOnValue,
    isResultFailure,
} from "@/utilities/_module-exports.js";
import type { FallbackSettings } from "@/resilience/middlewares/fallback/fallback.types.js";
import { callErrorPolicyOnThrow } from "@/utilities/_module-exports.js";
import type {
    AsyncMiddlewareFn,
    HookContext,
} from "@/hooks/_module-exports.js";

/**
 * The `fallback` middleware adds fallback value when an error occurs.
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Middlewares
 *
 * @example
 * ```ts
 * import { fallback } from "@daiso-tech/core/resilience";
 * import { AsyncHooks } from "@daiso-tech/core/hooks";
 *
 * const fetchData = new AsyncHooks(async (url: string): Promise<unknown> => {
 *   const response = await fetch(url);
 *   const json = await response.json();
 *   if (!response.ok) {
 *     throw json
 *   }
 *   return json;
 * }, [
 *   fallback({ fallbackValue: null })
 * ]);
 *
 * // Will return null when the fetch method throws an error.
 * console.log(await fetchData.invoke("URL_ENDPOINT"));
 * ```
 *
 * The middleware works also when the function returns a {@link Result | `Result`} type.
 * @example
 * ```ts
 * import { fallback } from "@daiso-tech/core/resilience";
 * import { AsyncHooks } from "@daiso-tech/core/hooks";
 * import { Result, resultFailure, resultSuccess } from "@daiso-tech/core/utilities";
 *
 * const fetchData = new AsyncHooks(async (url: string): Promise<Result> => {
 *   const response = await fetch(url);
 *   const json = await response.json();
 *   if (!response.ok) {
 *     return resultFailure(json);
 *   }
 *   return resultSuccess(json);
 * }, [
 *   fallback({ fallbackValue: null })
 * ]);
 *
 * // Will return null when the fetch method throws an error.
 * console.log(await fetchData.invoke("URL_ENDPOINT"));
 * ```
 */
export function fallback<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<
        FallbackSettings<TParameters, TReturn, TContext, TReturn>
    >,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const { fallbackValue, errorPolicy, onFallback = () => {} } = settings;
    return async (args, next, { context }): Promise<TReturn> => {
        try {
            const value = await next(...args);

            // Handle fallback value if an Result type is returned
            if (!(await callErrorPolicyOnValue(errorPolicy, value))) {
                return value;
            }
            // This is only needed for type inference
            if (!isResultFailure(value)) {
                return value;
            }

            const resolvedFallbackValue =
                await resolveAsyncLazyable(fallbackValue);
            callInvokable(onFallback, {
                error: value.error,
                fallbackValue: resolvedFallbackValue as TReturn,
                args,
                context,
            });
            return resultSuccess(resolvedFallbackValue) as TReturn;

            // Handle fallback value if an error is thrown
        } catch (error: unknown) {
            if (!(await callErrorPolicyOnThrow<any>(errorPolicy, error))) {
                throw error;
            }
            const resolvedFallbackValue =
                await resolveAsyncLazyable(fallbackValue);
            callInvokable(onFallback, {
                error,
                fallbackValue: resolvedFallbackValue as TReturn,
                args,
                context,
            });
            return resolvedFallbackValue as TReturn;
        }
    };
}

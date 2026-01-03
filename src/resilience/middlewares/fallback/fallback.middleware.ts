/**
 * @module Resilience
 */

import { type AsyncMiddlewareFn, type HookContext } from "@/hooks/_module.js";
import { type FallbackSettings } from "@/resilience/middlewares/fallback/fallback.types.js";
import {
    resolveAsyncLazyable,
    callInvokable,
    callErrorPolicyOnValue,
    callErrorPolicyOnThrow,
} from "@/utilities/_module.js";

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
 */
export function fallback<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<FallbackSettings<TParameters, TReturn, TContext>>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const { fallbackValue, errorPolicy, onFallback = () => {} } = settings;
    return async (args, next, { context }): Promise<TReturn> => {
        try {
            const value = await next(...args);

            if (!callErrorPolicyOnValue(errorPolicy, value)) {
                return value;
            }

            const resolvedFallbackValue =
                await resolveAsyncLazyable(fallbackValue);
            callInvokable(onFallback, {
                error: value,
                fallbackValue: resolvedFallbackValue,
                args,
                context,
            });
            return resolvedFallbackValue;

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

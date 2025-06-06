/**
 * @module Async
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type Result,
    type HookContext,
    resolveAsyncLazyable,
    callInvokable,
    isResult,
    resultSuccess,
} from "@/utilities/_module-exports.js";
import type { AsyncMiddlewareFn } from "@/utilities/_module-exports.js";
import type { FallbackSettings } from "@/async/middlewares/fallback/fallback.types.js";
import { callErrorPolicy } from "@/utilities/_module-exports.js";

/**
 * The `fallback` middleware adds fallback value when an error occurs.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 *
 * @example
 * ```ts
 * import { fallback } from "@daiso-tech/core/async";
 * import { AsyncHooks } from "@daiso-tech/core/utilities";
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
 * import { fallback } from "@daiso-tech/core/async";
 * import { AsyncHooks, Result, resultFailure, resultSuccess } from "@daiso-tech/core/utilities";
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
            if (
                !isResult(value) ||
                value.type === "success" ||
                !(await callErrorPolicy<any>(errorPolicy, value))
            ) {
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
            if (!(await callErrorPolicy<any>(errorPolicy, error))) {
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

/**
 * @module Async
 */

import type {
    HookContext,
    AsyncLazyable,
} from "@/utilities/_module-exports.js";
import {
    callInvokable,
    resolveAsyncLazyable,
    type AsyncMiddlewareFn,
    type Invokable,
} from "@/utilities/_module-exports.js";
import {
    type ErrorPolicy,
    callErrorPolicy,
} from "@/async/middlewares/_shared.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnFallbackData<
    TParameters extends unknown[] = unknown[],
    TFallbackValue = unknown,
    TContext extends HookContext = HookContext,
> = {
    error: unknown;
    fallbackValue: TFallbackValue;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnFallback<
    TParameters extends unknown[] = unknown[],
    TFallbackValue = unknown,
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnFallbackData<TParameters, TFallbackValue, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type FallbackCallbacks<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback {@link Invokable | `Invokable`} that will be called before fallback value is returned.
     */
    onFallback?: OnFallback<TParameters, TReturn, TContext>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type FallbackSettings<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = FallbackCallbacks<TParameters, TReturn, TContext> & {
    fallbackValue: AsyncLazyable<TReturn>;

    /**
     * You can choose what errors you want to add fallback value. By default fallback value will be added to all errors.
     *
     * @default
     * ```ts
     * (_error: unknown) => true
     * ```
     */
    errorPolicy?: ErrorPolicy;
};

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
 */
export function fallback<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<FallbackSettings<TParameters, TReturn, TContext>>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        fallbackValue,
        errorPolicy = () => true,
        onFallback = () => {},
    } = settings;
    return async (args, next, { context }): Promise<TReturn> => {
        try {
            return await next(...args);
        } catch (error: unknown) {
            if (await callErrorPolicy(errorPolicy, error)) {
                const resolvedFallbackValue =
                    await resolveAsyncLazyable(fallbackValue);
                callInvokable(onFallback, {
                    error,
                    fallbackValue: resolvedFallbackValue,
                    args,
                    context,
                });
                return resolvedFallbackValue;
            }
            throw error;
        }
    };
}

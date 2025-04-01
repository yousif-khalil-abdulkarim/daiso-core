/**
 * @module Async
 */

import type {
    HookContext,
    AsyncLazyable,
    AsyncNextFunc,
} from "@/utilities/_module-exports.js";
import {
    callInvokable,
    resolveAsyncLazyable,
    type AsyncMiddlewareFn,
    type Invokable,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
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
 * @group Middleware
 */
export type OnFallback<
    TParameters extends unknown[] = unknown[],
    TFallbackValue = unknown,
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnFallbackData<TParameters, TFallbackValue, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type FallbackPolicy = Invokable<[error: unknown], boolean>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type FallbackMiddlewareSettings<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    fallbackValue: AsyncLazyable<TReturn>;

    /**
     * You can choose what errors you want to add fallback value. By default fallback value will be added to all errors.
     *
     * @default
     * ```ts
     * () => true
     * ```
     */
    fallbackPolicy?: FallbackPolicy;

    /**
     * Callback function that will be called before fallback values is returned.
     */
    onFallback?: OnFallback<TParameters, TReturn, TContext>;
};

/**
 * The `fallbackMiddleware` adds fallback value when an error occurs.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 * @example
 * ```ts
 * import { fallbackMiddleware } from "@daiso-tech/core/async";
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
 *   fallbackMiddleware({ fallbackValue: null })
 * ]);
 *
 * // Will return null when the fetch method throws an error.
 * console.log(await fetchData.invoke("URL_ENDPOINT"));
 * ```
 *
 * @example
 * ```ts
 * import { fallbackMiddleware, LazyPromise } from "@daiso-tech/core/async";
 *
 * const promise = await new LazyPromise(async (): Promise<unknown> => {
 *   const response = await fetch("URL_ENDPOINT");
 *   const json = await response.json();
 *   if (!response.ok) {
 *     throw json
 *   }
 *   return json;
 * })
 * .pipe(fallbackMiddleware({ fallbackValue: null }));
 *
 * // Will return null when the fetch method throws an error.
 * console.log(await promise);
 * ```
 */
export function fallbackMiddleware<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<
        FallbackMiddlewareSettings<TParameters, TReturn, TContext>
    >,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        fallbackValue,
        fallbackPolicy = () => true,
        onFallback = () => {},
    } = settings;
    return async (
        args: TParameters,
        next: AsyncNextFunc<TParameters, TReturn>,
        context: TContext,
    ): Promise<TReturn> => {
        try {
            return await next(...args);
        } catch (error: unknown) {
            if (callInvokable(fallbackPolicy, error)) {
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

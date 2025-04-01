/**
 * @module Async
 */

import type { HookContext } from "@/utilities/_module-exports.js";
import {
    callInvokable,
    type AsyncMiddlewareFn,
    type Invokable,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnSuccessData<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    returnValue: TReturn;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnSuccess<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnSuccessData<TParameters, TReturn, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnErrorData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    error: unknown;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnError<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnErrorData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnFinally<TContext extends HookContext = HookContext> = Invokable<
    [context: TContext]
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type ObservationMiddlewareSettings<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback function that will be called when the underlying function is successfully called.
     */
    onSuccess?: OnSuccess<TParameters, TReturn, TContext>;

    /**
     * Callback function that will be called when the underlying function throws an error.
     */
    onError?: OnError<TParameters, TContext>;

    /**
     * Callback function that will be called when the underlying function throws an error or is successfully called.
     */
    onFinally?: OnFinally<TContext>;
};

/**
 * The `observationMiddleware` tracks an async function's state and runs callbacks when it fails with an error or succeeds.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 */
export function observationMiddleware<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: ObservationMiddlewareSettings<TParameters, TReturn, TContext>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        onSuccess = () => {},
        onError = () => {},
        onFinally = () => {},
    } = settings;
    return async (args, next, context) => {
        try {
            const returnValue = await next(...args);
            callInvokable(onSuccess, {
                args,
                context,
                returnValue,
            });
            return returnValue;
        } catch (error: unknown) {
            callInvokable(onError, {
                args,
                context,
                error,
            });
            throw error;
        } finally {
            callInvokable(onFinally, context);
        }
    };
}

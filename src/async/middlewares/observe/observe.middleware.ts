/**
 * @module Async
 */

import { TimeSpan, type HookContext } from "@/utilities/_module-exports.js";
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
export type OnObserveStartData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnObserveStart<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnObserveStartData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnObserveSuccessData<
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
export type OnObserveSuccess<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnObserveSuccessData<TParameters, TReturn, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnObserveErrorData<
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
export type OnObserveFinallyData<TContext extends HookContext = HookContext> = {
    executionTime: TimeSpan;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnObserveError<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnObserveErrorData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnObserveFinally<TContext extends HookContext = HookContext> =
    Invokable<[data: OnObserveFinallyData<TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type ObserveCallbacks<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback function that will be called when before the underlying {@link Invokable | `Invokable`} is called.
     */
    onStart?: OnObserveStart<TParameters, TContext>;

    /**
     * Callback function that will be called when the underlying {@link Invokable | `Invokable`} is successfully called.
     */
    onSuccess?: OnObserveSuccess<TParameters, TReturn, TContext>;

    /**
     * Callback function that will be called when the underlying {@link Invokable | `Invokable`} throws an error.
     */
    onError?: OnObserveError<TParameters, TContext>;

    /**
     * Callback function that will be called when the underlying {@link Invokable | `Invokable`} throws an error or is successfully called.
     */
    onFinally?: OnObserveFinally<TContext>;
};

/**
 * The `observe` middleware tracks an async function's state and runs callbacks when it fails with an error or succeeds.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 * @example
 * ```ts
 * import { observe, LazyPromise } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";
 *
 * await new AsyncHooks(
 *   // Lets pretend this function can throw and takes time to execute.
 *   async (a: number, b: number): Promise<number> => {
 *      const shouldThrow1 = Math.round(Math.random() * 100);
 *      if (shouldThrow1 > 50) {
 *        throw new Error("Unexpected error occured");
 *      }
 *      await LazyPromise.delay(TimeSpan.fromMilliseconds(Math.random() * 1000));
 *      const shouldThrow2 = Math.round(Math.random() * 100);
 *      if (shouldThrow2 > 50) {
 *        throw new Error("Unexpected error occured");
 *      }
 *      return a / b;
 *   },
 *   observe({
 *     onStart: (data) => console.log("START:", data),
 *     onSuccess: (data) => console.log("SUCCESS:", data),
 *     onError: (data) => console.error("ERROR:", data),
 *     onFinally: (data) => console.log("FINALLY:", data),
 *   })
 * )
 * .invoke(20, 10);
 * // Will log when the function execution has started and the arguments.
 * // Will log if the function succeded, the arguments and the return value.
 * // Will log if the function errored, arguments and the error.
 * // Will log the execution time and arguments
 * ```
 */
export function observe<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<ObserveCallbacks<TParameters, TReturn, TContext>>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        onStart = () => {},
        onSuccess = () => {},
        onError = () => {},
        onFinally = () => {},
    } = settings;
    return async (args, next, { context }) => {
        const start = performance.now();
        try {
            callInvokable(onStart, {
                args,
                context,
            });
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
            const end = performance.now();
            const time = end - start;
            callInvokable(onFinally, {
                context,
                executionTime: TimeSpan.fromMilliseconds(time),
            });
        }
    };
}

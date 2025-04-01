/**
 * @module Async
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type AsyncMiddlewareFn,
    type HookContext,
} from "@/utilities/_module-exports.js";
import { callInvokable, type Invokable } from "@/utilities/_module-exports.js";
import { AbortAsyncError, TimeoutAsyncError } from "@/async/async.errors.js";
import { abortAndFail } from "@/async/utilities/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnTimeoutData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    time: TimeSpan;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type OnTimeout<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnTimeoutData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type AbortSignalBinder<TParameters extends unknown[] = unknown[]> =
    Invokable<[arguments_: TParameters, signal: AbortSignal], TParameters>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export type TimeoutMiddlewareSettings<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    time: TimeSpan;

    signalBinder?: AbortSignalBinder<TParameters>;

    /**
     * Callback function that will be called when the timeout occurs.
     */
    onTimeout?: OnTimeout<TParameters, TContext>;
};

/**
 * The <i>timeoutMiddleware</i> automatically cancels async functions after a specified time period, throwing an error when aborted.
 * Note the original function continues executing (even if the promise fails), you'll need to provide a settings.signalBinder to forward the <i>settings.signal</i>.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 *
 * @example
 * ```ts
 * import { timeoutMiddleware } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";
 *
 * const abortController = new AbortController();
 *
 * const promise = new AsyncHooks(async (url: string, signal?: AbortSignal): Promise<unknown> => {
 *   const response = await fetch(url, {
 *     signal
 *   });
 *   const json = await response.json();
 *   if (!response.ok) {
 *     throw json
 *   }
 *   return json;
 * }, timeoutMiddleware({
 *   time: TimeSpan.fromSeconds(2),
 *   // With the defined signalBinder the HTTP request will be arboted when timed out or when the inputed <i>AbortSignal</i> is called.
 *   signalBinder: ([url, fetchSignal], timeoutSignal) => {
 *     return [
 *       url,
 *       AbortSignal.any([
 *         fetchSignal,
 *         timeoutSignal
 *       ].filter(signal => signal !== undefined))
 *     ];
 *   }
 * }))
 * .invoke("ENDPOINT", abortController.signal);
 *
 * abortController.abort();
 *
 * // An error will be thrown.
 * await promise;
 * ```
 *
 * @example
 * ```ts
 * import { LazyPromise, timeoutMiddleware } from "@daiso-tech/core/async";
 * import { TimeSpan } from "@daiso-tech/core/utilities";
 *
 * await new LazyPromise(() => {
 *   const response = await fetch(url, {
 *     signal
 *   });
 *   const json = await response.json();
 *   if (!response.ok) {
 *     throw json
 *   }
 *   return json;
 * })
 * .pipe(timeoutMiddleware({ time: TimeSpan.fromSeconds(2) }));
 * ```
 */
export function timeoutMiddleware<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: TimeoutMiddlewareSettings<TParameters, TContext>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        time,
        signalBinder = (args) => args,
        onTimeout = () => {},
    } = settings;
    return async (args, next, context) => {
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => {
            timeoutController.abort(
                new TimeoutAsyncError("The promise exceded time"),
            );
        }, time.toMilliseconds());
        try {
            return await abortAndFail(
                next(
                    ...callInvokable(
                        signalBinder,
                        args,
                        timeoutController.signal,
                    ),
                ),
                timeoutController.signal,
            );
        } catch (error: unknown) {
            if (
                error instanceof AbortAsyncError &&
                error.cause instanceof TimeoutAsyncError
            ) {
                callInvokable(onTimeout, { time, args, context });
                throw error.cause;
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    };
}

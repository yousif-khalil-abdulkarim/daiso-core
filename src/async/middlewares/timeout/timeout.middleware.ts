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
    maxTime: TimeSpan;
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
export type TimeoutSettings<
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
 * The `timeout` middleware automatically cancels functions after a specified time period, throwing an error when aborted.
 * Note the original function continues executing (even if the promise fails), you'll need to provide a settings.signalBinder to forward the `AbortSignal`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 *
 * @example
 * ```ts
 * import { timeout } from "@daiso-tech/core/async";
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
 * }, timeout({
 *   time: TimeSpan.fromSeconds(2),
 *   // With the defined signalBinder the HTTP request will be arboted when timed out or when the inputed `AbortSignal` is called.
 *   signalBinder: ([url, fetchSignal], timeoutSignal) => {
 *     return [
 *       url,
 *       AbortSignal.any([
 *         fetchSignal,
 *         timeoutSignal
 *       ].filter(signal => signal !== undefined))
 *     ] as const;
 *   }
 * }))
 * .invoke("ENDPOINT", abortController.signal);
 *
 * abortController.abort();
 *
 * // An error will be thrown.
 * await promise;
 * ```
 */
export function timeout<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<TimeoutSettings<TParameters, TContext>>,
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
                callInvokable(onTimeout, { maxTime: time, args, context });
                throw error.cause;
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    };
}

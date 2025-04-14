/**
 * @module Async
 */

import { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type AsyncMiddlewareFn,
    type HookContext,
} from "@/utilities/_module-exports.js";
import { callInvokable, type Invokable } from "@/utilities/_module-exports.js";
import { TimeoutAsyncError } from "@/async/async.errors.js";
import { timeoutAndFail } from "@/async/utilities/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnTimeoutData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    waitTime: TimeSpan;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnTimeout<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnTimeoutData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type TimeoutCallbacks<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback function that will be called when the timeout occurs.
     */
    onTimeout?: OnTimeout<TParameters, TContext>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type TimeoutSettings<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = TimeoutCallbacks<TParameters, TContext> & {
    /**
     * The maximum time to wait before automatically aborting the executing function.
     *
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * TimeSpan.fromSeconds(2)
     * ```
     */
    waitTime?: TimeSpan;
};

/**
 * The `timeout` middleware automatically cancels functions after a specified time period, throwing an error when aborted.
 * Note the original function continues executing (even if the promise fails), you'll need to provide a settings.signalBinder to forward the `AbortSignal`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 *
 * @example
 * ```ts
 * import { timeout } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";
 *
 * const data = await new AsyncHooks(
 *   async (url: string, signal?: AbortSignal): Promise<unknown> => {
 *     const response = await fetch(url, { signal });
 *     return await response.json();
 *   },
 *   [timeout({ waitTime: TimeSpan.fromSeconds(2) })],
 *   {
 *     signalBinder: {
 *       getSignal: (args) => args[1],
 *       forwardSignal: (args, signal) => {
 *         args[1] = signal;
 *       }
 *     }
 *   }
 * )
 * .invoke("URL");
 * ```
 */
export function timeout<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<TimeoutSettings<TParameters, TContext>> = {},
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const { waitTime = TimeSpan.fromSeconds(2), onTimeout = () => {} } =
        settings;
    return async (args, next, { context, abort, signal }) => {
        try {
            return await timeoutAndFail(
                next(...args),
                waitTime,
                (error: unknown) => {
                    abort(error);
                },
                signal,
            );
        } catch (error: unknown) {
            if (error instanceof TimeoutAsyncError) {
                callInvokable(onTimeout, {
                    args,
                    context,
                    waitTime,
                });
            }
            throw error;
        }
    };
}

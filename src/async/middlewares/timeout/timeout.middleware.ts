/**
 * @module Async
 */

import { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type AsyncMiddlewareFn,
    type HookContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type AbortSignalBinder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type AsyncHooks,
} from "@/utilities/_module-exports.js";
import { callInvokable, type Invokable } from "@/utilities/_module-exports.js";
import { TimeoutAsyncError } from "@/async/async.errors.js";
import { timeoutAndFail } from "@/async/utilities/timeout-and-fail/_module.js";

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
     * Callback {@link Invokable | `Invokable`} that will be called before the timeout occurs.
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
 *
 * Note when a timeout occurs, the function call continues executing in the background and only the `Promise` will be aborted.
 * To ensure correct abortion behavior, provide an {@link AbortSignalBinder | `AbortSignalBinder`} to {@link AsyncHooks | `AsyncHooks`}.
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

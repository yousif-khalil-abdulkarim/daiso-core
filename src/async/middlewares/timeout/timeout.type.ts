/**
 * @module Async
 */

import type { ITimeSpan, TimeSpan } from "@/utilities/_module-exports.js";
import { type HookContext } from "@/utilities/_module-exports.js";
import { type Invokable } from "@/utilities/_module-exports.js";

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
    waitTime?: ITimeSpan;
};

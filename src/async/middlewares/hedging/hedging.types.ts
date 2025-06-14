/**
 * @module Async
 */

import {
    type AsyncMiddleware,
    type HookContext,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import type {
    ErrorPolicySettings,
    InferResultError,
} from "@/utilities/_module-exports.js";
import {
    type Invokable,
    type Promisable,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnHedgeAttemptData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    name: string;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnHedgeAttempt<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnHedgeAttemptData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnHedgeErrorData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    name: string;
    error: unknown;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnHedgeError<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnHedgeErrorData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type HedgingCallbacks<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback {@link Invokable | `Invokable`} that will be called before execution attempt.
     */
    onHedgingAttempt?: OnHedgeAttempt<TParameters, TContext>;

    /**
     * Callback {@link Invokable | `Invokable`} that will be called when the error occurs.
     */
    onHedgingError?: OnHedgeError<TParameters, TContext>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type Fallback<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
> = Invokable<TParameters, Promisable<TReturn>>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type NamedFallback<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
> = {
    /**
     * You can assign a custom name to the fallback {@link Invokable | `Invokable`} for easier identification in logs.
     */
    name: string;
    invokable: Fallback<TParameters, TReturn>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type HedgingSettings<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = HedgingCallbacks<TParameters, TContext> &
    ErrorPolicySettings<InferResultError<TReturn>> & {
        /**
         * The fallback functions that run in case the primary function fails.
         *
         * @default
         * ```ts
         * import { retry } from "@daiso-tech/core/async";
         * import { timeout } from "@daiso-tech/core/async";
         *
         * [timeout(), retry()]
         * ```
         */
        fallbacks: OneOrMore<
            Fallback<TParameters, TReturn> | NamedFallback<TParameters, TReturn>
        >;

        /**
         * Middlewares to apply on all fallback functions and on primary function.
         *
         * You can wrap primary and fallback functions with for example `retry` and `timeout` middlewares.
         * @example
         * ```ts
         * import { retry, timeout, sequentialHedging } from "@daiso-tech/core/async";
         *
         * new AsyncHooks(fn, [
         *   sequentialHedging({
         *     fallbacks: [
         *       fn1,
         *       fn2,
         *       fn3,
         *     ],
         *     middlewares: [
         *       timeout({
         *         waitTime: TimeSpan.fromSeconds(2),
         *       }),
         *       retry({
         *         maxAttempts: 4
         *       }),
         *     ]
         *   })
         * ], {
         *   signalBinder,
         * })
         * ```
         */
        middlewares?: Array<AsyncMiddleware<TParameters, TReturn>>;
    };

/**
 * @module Async
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type HookContext,
    type Invokable,
    type OneOrMore,
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
     * Callback function that will be called before execution attempt.
     */
    onHedgeAttempt?: OnHedgeAttempt<TParameters, TContext>;

    /**
     * Callback function that will be called when the error occurs.
     */
    onHedgeError?: OnHedgeError<TParameters, TContext>;
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
     * You can assign a custom name to the fallback function for easier identification in logs.
     */
    name: string;
    func: Fallback<TParameters, TReturn>;
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
> = HedgingCallbacks<TParameters, TContext> & {
    /**
     * The maximum time to wait before automatically aborting the executing primary function or fallback functions.
     *
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * TimeSpan.fromSeconds(2)
     * ```
     */
    waitTime?: TimeSpan;

    /**
     * The fallback functions that run in case the primary function fails.
     */
    fallbacks: OneOrMore<
        Fallback<TParameters, TReturn> | NamedFallback<TParameters, TReturn>
    >;
};

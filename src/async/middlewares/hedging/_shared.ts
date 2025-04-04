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
import type { AbortSignalBinder } from "@/async/middlewares/_shared.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
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
 * @group Utilities
 */
export type OnHedgeAttempt<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnHedgeAttemptData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
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
 * @group Utilities
 */
export type OnHedgeError<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnHedgeErrorData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
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
 * @group Utilities
 */
export type Fallback<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
> = Invokable<TParameters, Promisable<TReturn>>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type NamedFallback<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
> = {
    name: string;
    func: Fallback<TParameters, TReturn>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type HedgingSettings<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = HedgingCallbacks<TParameters, TContext> & {
    waitTime: TimeSpan;
    fallbacks: OneOrMore<
        Fallback<TParameters, TReturn> | NamedFallback<TParameters, TReturn>
    >;
    signalBinder?: AbortSignalBinder<TParameters>;
};

/**
 * @internal
 */
export type ExecuteFallbackSettings<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
> = {
    func: Fallback<TParameters, TReturn>;
    signalBinder: AbortSignalBinder<TParameters>;
    abortSignal: AbortSignal;
    waitTime: TimeSpan;
    onHedgeAttempt: OnHedgeAttempt<TParameters, TContext>;
    onHedgeError: OnHedgeError<TParameters, TContext>;
    name: string;
    args: TParameters;
};

/**
 * @module Async
 */

import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type { InferResultSuccess } from "@/utilities/_module-exports.js";
import { type HookContext } from "@/utilities/_module-exports.js";
import { type Invokable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
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
 * @group Middlewares
 */
export type OnObserveStart<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnObserveStartData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnObserveSuccessData<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    returnValue: InferResultSuccess<TReturn>;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnObserveSuccess<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnObserveSuccessData<TParameters, TReturn, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
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
 * @group Middlewares
 */
export type OnObserveFinallyData<TContext extends HookContext = HookContext> = {
    executionTime: TimeSpan;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnObserveError<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnObserveErrorData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnObserveFinally<TContext extends HookContext = HookContext> =
    Invokable<[data: OnObserveFinallyData<TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type ObserveCallbacks<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback {@link Invokable | `Invokable`} that will be called when before the underlying {@link Invokable | `Invokable`} is called.
     */
    onStart?: OnObserveStart<TParameters, TContext>;

    /**
     * Callback {@link Invokable | `Invokable`} that will be called when the underlying {@link Invokable | `Invokable`} is successfully called.
     */
    onSuccess?: OnObserveSuccess<TParameters, TReturn, TContext>;

    /**
     * Callback {@link Invokable | `Invokable`} that will be called when the underlying {@link Invokable | `Invokable`} throws an error.
     */
    onError?: OnObserveError<TParameters, TContext>;

    /**
     * Callback {@link Invokable | `Invokable`} that will be called when the underlying {@link Invokable | `Invokable`} throws an error or is successfully called.
     */
    onFinally?: OnObserveFinally<TContext>;
};

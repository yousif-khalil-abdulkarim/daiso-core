/**
 * @module Async
 */

import type { InferResultError } from "@/utilities/_module-exports.js";
import { type Invokable } from "@/utilities/_module-exports.js";
import { type BackoffPolicy } from "@/backoff-policies/_module-exports.js";
import { type ErrorPolicySettings } from "@/utilities/_module-exports.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import type { HookContext } from "@/hooks/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnRetryAttemptData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    attempt: number;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnExecutionAttempt<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnRetryAttemptData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnRetryDelayData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    error: unknown;
    attempt: number;
    waitTime: ITimeSpan;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnRetryDelay<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnRetryDelayData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type RetryCallbacks<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback {@link Invokable | `Invokable`} that will be called before execution attempt.
     */
    onExecutionAttempt?: OnExecutionAttempt<TParameters, TContext>;

    /**
     * Callback {@link Invokable | `Invokable`} that will be called before the retry delay starts.
     */
    onRetryDelay?: OnRetryDelay<TParameters, TContext>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type RetrySettings<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
    TReturn = unknown,
> = RetryCallbacks<TParameters, TContext> &
    ErrorPolicySettings<InferResultError<TReturn>> & {
        /**
         * You can decide maximal times you can retry.
         * @default 4
         */
        maxAttempts?: number;

        /**
         * @default
         * ```ts
         * import { exponentialBackoffPolicy } from "@daiso-tech/core/async";
         *
         * exponentialBackoffPolicy();
         * ```
         */
        backoffPolicy?: BackoffPolicy;
    };

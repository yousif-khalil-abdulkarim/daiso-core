/**
 * @module Resilience
 */

import type { HookContext } from "@/hooks/_module-exports.js";
import type {
    AsyncLazyable,
    InferResultSuccess,
    InferResultError,
} from "@/utilities/_module-exports.js";
import { type Invokable } from "@/utilities/_module-exports.js";
import { type ErrorPolicySettings } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Middlewares
 */
export type OnFallbackData<
    TParameters extends unknown[] = unknown[],
    TFallbackValue = unknown,
    TContext extends HookContext = HookContext,
> = {
    error: unknown;
    fallbackValue: TFallbackValue;
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Middlewares
 */
export type OnFallback<
    TParameters extends unknown[] = unknown[],
    TFallbackValue = unknown,
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnFallbackData<TParameters, TFallbackValue, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Middlewares
 */
export type FallbackCallbacks<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> = {
    /**
     * Callback {@link Invokable | `Invokable`} that will be called before fallback value is returned.
     */
    onFallback?: OnFallback<TParameters, TReturn, TContext>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Middlewares
 */
export type FallbackSettings<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
    TError = unknown,
> = FallbackCallbacks<TParameters, TReturn, TContext> &
    ErrorPolicySettings<InferResultError<TError>> & {
        fallbackValue: AsyncLazyable<InferResultSuccess<TReturn>>;
    };

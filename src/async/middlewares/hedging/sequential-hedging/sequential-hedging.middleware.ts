/**
 * @module Async
 */

import {
    callInvokable,
    isInvokable,
    resolveOneOrMore,
    TimeSpan,
    type AsyncMiddlewareFn,
    type HookContext,
} from "@/utilities/_module-exports.js";
import type {
    HedgingSettings,
    NamedFallback,
} from "@/async/middlewares/hedging/_shared.js";
import { HedgingAsyncError } from "@/async/async.errors.js";
import { timeoutAndFail } from "@/async/utilities/_module.js";

/**
 * The `sequentialHedging` middleware executes the primary function and all fallback functions sequentially.
 * It returns the result of the first successful resolution and automatically cancels all remaining operations.
 * If all function fail than error is thrown.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 * @throws {HedgingAsyncError} {@link HedgingAsyncError}
 */
export function sequentialHedging<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<HedgingSettings<TParameters, TReturn, TContext>>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        waitTime = TimeSpan.fromSeconds(2),
        fallbacks,
        onHedgeAttempt = () => {},
        onHedgeError = () => {},
    } = settings;

    const resolvedFallbacks = resolveOneOrMore(fallbacks).map<
        NamedFallback<TParameters, TReturn>
    >((fallback, index) => {
        if (isInvokable(fallback)) {
            return {
                name: `fallback-${String(index + 1)}`,
                func: fallback,
            };
        }
        return fallback;
    });

    return async (args, next, { context, signal, abort }) => {
        const errors: unknown[] = [];
        const funcs = [
            {
                name: "__initial",
                func: next,
            },
            ...resolvedFallbacks,
        ];
        for (const { name, func } of funcs) {
            try {
                callInvokable(onHedgeAttempt, {
                    args,
                    context,
                    name,
                });
                return await timeoutAndFail(
                    (async () => callInvokable(func, ...args))(),
                    waitTime,
                    (error: unknown) => {
                        abort(error);
                    },
                    signal,
                );
            } catch (error: unknown) {
                if (signal.aborted) {
                    break;
                }
                callInvokable(onHedgeError, {
                    args,
                    context,
                    error,
                    name,
                });
                errors.push(error);
            }
        }

        // If all promiseResults are rejected we will throw an error
        const funcNames = funcs
            .slice(1)
            .map(({ name }) => `"${name}"`)
            .join(", ");
        throw new HedgingAsyncError(
            `The original function and fallback functions failed: ${funcNames}`,
            errors,
        );
    };
}

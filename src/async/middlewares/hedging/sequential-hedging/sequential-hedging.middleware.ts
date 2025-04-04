/**
 * @module Async
 */

import {
    AsyncHooks,
    callInvokable,
    isInvokable,
    resolveOneOrMore,
    type AsyncMiddlewareFn,
    type HookContext,
} from "@/utilities/_module-exports.js";
import type {
    HedgingSettings,
    NamedFallback,
} from "@/async/middlewares/hedging/_shared.js";
import { HedgingAsyncError } from "@/async/async.errors.js";
import { timeout } from "@/async/middlewares/timeout/_module.js";
import { observe } from "@/async/middlewares/observe/_module.js";

/**
 * The `sequentialHedging` middleware
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export function sequentialHedging<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<HedgingSettings<TParameters, TReturn, TContext>>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        waitTime,
        fallbacks,
        signalBinder = (args) => args,
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

    return async (args, next, context) => {
        const errors: unknown[] = [];
        for (const { name, func } of [
            {
                name: "__initial",
                func: next,
            },
            ...resolvedFallbacks,
        ]) {
            const userAbortController = new AbortController();
            try {
                return await new AsyncHooks<TParameters, TReturn, TContext>(
                    (...args) =>
                        callInvokable(
                            func,
                            ...callInvokable(
                                signalBinder,
                                args,
                                userAbortController.signal,
                            ),
                        ),
                    [
                        timeout({
                            waitTime,
                            signalBinder,
                        }),
                        observe({
                            onStart: ({ args, context }) => {
                                callInvokable(onHedgeAttempt, {
                                    args,
                                    context,
                                    name,
                                });
                            },
                            onError: ({ args, context, error }) => {
                                callInvokable(onHedgeError, {
                                    args,
                                    context,
                                    error,
                                    name,
                                });
                            },
                        }),
                    ],
                    context,
                ).invoke(...args);
            } catch (error: unknown) {
                if (userAbortController.signal.aborted) {
                    break;
                }
                errors.push(error);
            }
        }
        throw new HedgingAsyncError("!!__MESSAGE__!!", errors);
    };
}

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
import { observe } from "@/async/middlewares/observe/observe.middleware.js";
import { abortAndFail } from "@/async/_module-exports.js";

/**
 * @internal
 */
class ResolvedError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = ResolvedError.name;
    }
}

/**
 * The `concurrentHedging` middleware
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 */
export function concurrentHedging<
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
        // The controller is used for aborting all other concurrent promises when one promise resolves.
        const resolveAbortController = new AbortController();
        const promises = [
            {
                name: "__initial",
                func: next,
            },
            ...resolvedFallbacks,
        ]
            .map(({ name, func }) => ({
                name,
                promise: abortAndFail(
                    // func might return promise and we need to convert to a promise because that what abortAndFail expects.
                    (async () =>
                        callInvokable(
                            func,
                            ...callInvokable(
                                signalBinder,
                                args,
                                new AbortController().signal,
                            ),
                        ))(),
                    resolveAbortController.signal,
                ),
            }))
            .map(async ({ name, promise }) => {
                const returnValue = await promise;
                // We abort all other promises when on promise succeds.
                resolveAbortController.abort(
                    new ResolvedError("Already resolved"),
                );
                return {
                    name,
                    returnValue,
                };
            });

        const promiseResults = await Promise.allSettled(promises);
        const errors: unknown[] = [];
        for (const promiseResult of promiseResults) {
            // We return the first fulfilled value
            if (promiseResult.status === "fulfilled") {
                return promiseResult.value.returnValue;
            } else if (!(promiseResult.reason instanceof ResolvedError)) {
                errors.push(promiseResult.reason);
            }
        }

        // If all promiseResults are rejected we will throw an error
        throw new HedgingAsyncError("!!__message__!!", errors);
    };
}

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
    Fallback,
    HedgingSettings,
    NamedFallback,
} from "@/async/middlewares/hedging/_shared.js";
import { HedgingAsyncError } from "@/async/async.errors.js";
import { timeoutAndFail } from "@/async/utilities/_module.js";

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
 * The `concurrentHedging` middleware executes the primary function and all fallback functions concurrently.
 * It returns the result of the first successful resolution and automatically cancels all remaining operations.
 * If all function fail than error is thrown.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 * @throws {HedgingAsyncError} {@link HedgingAsyncError}
 */
export function concurrentHedging<
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

    return async (args, next, { context, abort, signal }) => {
        type Step1 = {
            name: string;
            func: Fallback<TParameters, TReturn>;
        };
        type Step2 = {
            name: string;
            promise: PromiseLike<TReturn>;
        };
        type Step3 =
            | {
                  type: "success";
                  value: TReturn;
                  name: string;
              }
            | {
                  type: "failure";
                  error: unknown;
                  name: string;
              };
        function step1({ name, func }: Step1): Step2 {
            return {
                name,
                promise: timeoutAndFail(
                    (async () => callInvokable(func, ...args))(),
                    waitTime,
                    (error: unknown) => {
                        abort(error);
                    },
                    signal,
                ),
            };
        }
        async function step2({ name, promise }: Step2): Promise<Step3> {
            try {
                const value = await promise;
                // We abort all other promises when on promise succeds.
                abort(new ResolvedError("Already resolved"));
                return {
                    type: "success",
                    value,
                    name,
                };
            } catch (error: unknown) {
                return {
                    type: "failure",
                    error,
                    name,
                };
            }
        }
        const funcs = [
            {
                name: "__initial",
                func: next,
            },
            ...resolvedFallbacks,
        ];
        const promises = funcs.map(step1).map(step2);

        const errors: unknown[] = [];
        const promiseResults = await Promise.all(promises);
        for (const promiseResult of promiseResults) {
            callInvokable(onHedgeAttempt, {
                args,
                context,
                name: promiseResult.name,
            });

            // We return the first fulfilled value
            if (promiseResult.type === "success") {
                return promiseResult.value;
            } else if (!(promiseResult.error instanceof ResolvedError)) {
                callInvokable(onHedgeError, {
                    args,
                    context,
                    error: promiseResult.error,
                    name: promiseResult.name,
                });
                errors.push(promiseResult.error);
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

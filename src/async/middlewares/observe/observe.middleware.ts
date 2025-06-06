/**
 * @module Async
 */

import {
    isResult,
    RESULT,
    TimeSpan,
    type HookContext,
    type InferResultSuccess,
} from "@/utilities/_module-exports.js";
import {
    callInvokable,
    type AsyncMiddlewareFn,
} from "@/utilities/_module-exports.js";
import type { ObserveCallbacks } from "@/async/middlewares/observe/observe.types.js";

/**
 * The `observe` middleware tracks an async function's state and runs callbacks when it fails with an error or succeeds.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 *
 * @example
 * ```ts
 * import { observe, LazyPromise } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";
 *
 * await new AsyncHooks(
 *   // Lets pretend this function can throw and takes time to execute.
 *   async (a: number, b: number): Promise<number> => {
 *      const shouldThrow1 = Math.round(Math.random() * 100);
 *      if (shouldThrow1 > 50) {
 *        throw new Error("Unexpected error occured");
 *      }
 *      await LazyPromise.delay(TimeSpan.fromMilliseconds(Math.random() * 1000));
 *      const shouldThrow2 = Math.round(Math.random() * 100);
 *      if (shouldThrow2 > 50) {
 *        throw new Error("Unexpected error occured");
 *      }
 *      return a / b;
 *   },
 *   observe({
 *     onStart: (data) => console.log("START:", data),
 *     onSuccess: (data) => console.log("SUCCESS:", data),
 *     onError: (data) => console.error("ERROR:", data),
 *     onFinally: (data) => console.log("FINALLY:", data),
 *   })
 * )
 * .invoke(20, 10);
 * // Will log when the function execution has started and the arguments.
 * // Will log if the function succeded, the arguments and the return value.
 * // Will log if the function errored, arguments and the error.
 * // Will log the execution time and arguments
 * ```
 *
 * The middleware works also when the function returns a {@link Result | `Result`} type.
 * @example
 * ```ts
 * import { observe, LazyPromise } from "@daiso-tech/core/async";
 * import { AsyncHooks, TimeSpan, Result, resultFailure, resultSuccess } from "@daiso-tech/core/utilities";
 *
 * await new AsyncHooks(
 *   // Lets pretend this function can throw and takes time to execute.
 *   async (a: number, b: number): Promise<Result<number, Error>> => {
 *      const shouldThrow1 = Math.round(Math.random() * 100);
 *      if (shouldThrow1 > 50) {
 *        return resultFailure(new Error("Unexpected error occured"));
 *      }
 *      await LazyPromise.delay(TimeSpan.fromMilliseconds(Math.random() * 1000));
 *      const shouldThrow2 = Math.round(Math.random() * 100);
 *      if (shouldThrow2 > 50) {
 *        return resultFailure(new Error("Unexpected error occured"));
 *      }
 *      return resultSuccess(a / b);
 *   },
 *   observe({
 *     onStart: (data) => console.log("START:", data),
 *     onSuccess: (data) => console.log("SUCCESS:", data),
 *     onError: (data) => console.error("ERROR:", data),
 *     onFinally: (data) => console.log("FINALLY:", data),
 *   })
 * )
 * .invoke(20, 10);
 * // Will log when the function execution has started and the arguments.
 * // Will log if the function succeded, the arguments and the return value.
 * // Will log if the function errored, arguments and the error.
 * // Will log the execution time and arguments
 * ```
 */
export function observe<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: NoInfer<ObserveCallbacks<TParameters, TReturn, TContext>>,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        onStart = () => {},
        onSuccess = () => {},
        onError = () => {},
        onFinally = () => {},
    } = settings;
    return async (args, next, { context }) => {
        const start = performance.now();
        try {
            callInvokable(onStart, {
                args,
                context,
            });
            const returnValue = await next(...args);

            // Should handle when Result type is returned
            if (isResult(returnValue)) {
                if (returnValue.type === RESULT.SUCCESS) {
                    callInvokable(onSuccess, {
                        args,
                        context,
                        returnValue:
                            returnValue.value as InferResultSuccess<TReturn>,
                    });
                    return returnValue;
                }

                callInvokable(onError, {
                    args,
                    context,
                    error: returnValue.error,
                });
                return returnValue;
            }

            callInvokable(onSuccess, {
                args,
                context,
                returnValue: returnValue as InferResultSuccess<TReturn>,
            });
            return returnValue;
        } catch (error: unknown) {
            callInvokable(onError, {
                args,
                context,
                error,
            });
            throw error;
        } finally {
            const end = performance.now();
            const time = end - start;
            callInvokable(onFinally, {
                context,
                executionTime: TimeSpan.fromMilliseconds(time),
            });
        }
    };
}

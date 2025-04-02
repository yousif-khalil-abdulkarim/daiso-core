/**
 * @module Async
 */

import type {
    HookContext,
    AsyncMiddleware,
} from "@/utilities/_module-exports.js";
import {
    callInvokable,
    type AsyncMiddlewareFn,
    type Invokable,
} from "@/utilities/_module-exports.js";

/**
 * The `dynamic` is wrapper middleware that allows configuration of other middlewares dynamically based on the function arguments and context.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middleware
 *
 * @example
 * ```ts
 * import { AsyncHooks } from "@daiso-tech/core/async";
 * import { dynamic, fallbackMiddleware } from "@daiso-tech/core/utilities";
 *
 * await new AsyncHooks(
 *   (a: number, b: number) => a / b,
 *   [
 *     // You pass callback function where you get access to the function arguments and context.
 *     // The callback function must return a middleware.
 *     dynamic((_args, _context) =>
 *       fallbackMiddleware({
 *         fallbackValue: 1,
 *       }),
 *     ),
 *   ],
 * ).invoke(1, 0);
 * ```
 */
export function dynamic<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    dynamic: NoInfer<
        Invokable<
            [arguments_: TParameters, context: TContext],
            AsyncMiddleware<TParameters, TReturn, TContext>
        >
    >,
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    return (args, next, context) => {
        const middleware = callInvokable(dynamic, args, context);
        return callInvokable(middleware, args, next, context);
    };
}

/**
 * @module Resilience
 */

import type {
    AsyncMiddleware,
    AsyncMiddlewareFn,
    HookContext,
} from "@/hooks/_module-exports.js";
import { callInvokable, type Invokable } from "@/utilities/_module-exports.js";

/**
 * The `dynamic` is wrapper middleware that allows configuration of other middlewares dynamically based on the function arguments and context.
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Middlewares
 *
 * @example
 * ```ts
 * import { dynamic, fallback  } from "@daiso-tech/core/resilience";
 * import { AsyncHooks } from "@daiso-tech/core/hooks";
 *
 * await new AsyncHooks(
 *   (a: number, b: number) => a / b,
 *   [
 *     // You pass callback function where you get access to the function arguments and context.
 *     // The callback function must return a middleware.
 *     dynamic((_args, _context) =>
 *       fallback({
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
    return (args, next, settings) => {
        const middleware = callInvokable(dynamic, args, settings.context);
        return callInvokable(middleware, args, next, settings);
    };
}

/**
 * @module Utilities
 */

import {
    resolveInvokable,
    resolveOneOrMore,
    type IInvokableObject,
    type Invokable,
    type InvokableFn,
    type OneOrMore,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Hooks
 */
export type Middleware<
    TParamters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> = Invokable<
    [
        arguments_: TParamters,
        next: InvokableFn<TParamters, TReturn>,
        context: TContext,
    ],
    TReturn
>;

/**
 * The <i>Hooks</i> provides a convenient way to change and inspect arguments and return value of both only sync functions.
 * For example <i>Hooks</i> class can be used to log function arguments and return values. Note this class will always return sync value and is immutable.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Hooks
 */
export class Hooks<
    TParamters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends Partial<Record<string, unknown>> = Partial<
        Record<string, unknown>
    >,
> implements IInvokableObject<TParamters, TReturn>
{
    private static init<TParamters extends unknown[], TReturn, TContext>(
        invokable: Invokable<TParamters, TReturn>,
        middlewares: OneOrMore<Middleware<TParamters, TReturn, TContext>>,
        context: TContext,
    ): InvokableFn<TParamters, TReturn> {
        let func = resolveInvokable(invokable);
        for (const hook of [...resolveOneOrMore(middlewares)]
            .reverse()
            .map(resolveInvokable)) {
            const prevFunc = func;
            func = (...arguments_: TParamters) =>
                hook(arguments_, prevFunc, context);
        }
        return func;
    }

    private readonly func: InvokableFn<TParamters, TReturn>;

    /**
     * @example
     * ```ts
     * import { Hooks, type Middleware } from "@daiso-tech/core/utilities";
     *
     * function logMiddleware<TParamters extends unknown[], TReturn>(): Middleware<TParamters, TReturn, { funcName: string; }> {
     *   return async (args, next, { funcName }) => {
     *     console.log("FUNCTION_NAME:", funcName);
     *     console.log("ARGUMENTS:", args);
     *     const value = await next(...args);
     *     console.log("RETURN:", value);
     *     return value;
     *   }
     * }
     *
     * function timeMiddleware<TParamters extends unknown[], TReturn>(): Middleware<TParamters, TReturn> {
     *   return async (args, next) => {
     *     const start = performance.now();
     *     const value = await next(...args);
     *     const end = performance.now();
     *     const time = end - start;
     *     console.log("TIME:", `${String(time)}ms`);
     *     return value;
     *   }
     * }
     *
     * function add(a: number, b: number): number {
     *   return a + b;
     * }
     *
     * const enhancedAdd = new Hooks(add, [
     *   logMiddleware(),
     *   timeMiddleware()
     * ],
     * // You can provide additional information to <i>Middleware</i> invokables.
     * {
     *    funcName: add.name
     * });
     *
     * // Will log the function name, arguments and return value.
     * // Will also log the execution time.
     * const result = await enhancedAdd.invoke(1, 2);
     *
     * // Will be 3.
     * console.log(result);
     * ```
     */
    constructor(
        private readonly invokable: Invokable<TParamters, TReturn>,
        private readonly middlewares: OneOrMore<
            Middleware<TParamters, TReturn, TContext>
        >,
        private readonly context = {} as TContext,
    ) {
        this.func = Hooks.init(invokable, middlewares, context);
    }

    /**
     * The <i>add</i> method returns a new <i>Hooks</i> instance with the additional <i>middlewares</i> applied.
     */
    add(
        middlewares: OneOrMore<Middleware<TParamters, TReturn, TContext>>,
    ): Hooks<TParamters, TReturn, TContext> {
        return new Hooks(
            this.invokable,
            [
                ...resolveOneOrMore(this.middlewares),
                ...resolveOneOrMore(middlewares),
            ],
            this.context,
        );
    }

    /**
     * The <i>addWhen</i> method conditionally applies additional <i>middlewares</i>, returning a new <i>Hooks</i> instance only if the specified condition is met.
     */
    addWhen(
        condition: boolean,
        middlewares: OneOrMore<Middleware<TParamters, TReturn, TContext>>,
    ): Hooks<TParamters, TReturn, TContext> {
        if (condition) {
            return this.add(middlewares);
        }
        return this;
    }

    /**
     * The <i>invoke</i> method executes the constructor's input function, applying all middlewares.
     */
    invoke(...arguments_: TParamters): TReturn {
        return this.func(...arguments_);
    }
}

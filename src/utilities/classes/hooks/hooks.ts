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
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> = Invokable<
    [
        arguments_: TParameters,
        next: InvokableFn<TParameters, TReturn>,
        context: TContext,
    ],
    TReturn
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Hooks
 */
export interface IHooksAware<
    TInstance,
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends Partial<Record<string, unknown>> = Partial<
        Record<string, unknown>
    >,
> {
    pipe(
        middlewares: OneOrMore<Middleware<TParameters, TReturn, TContext>>,
    ): TInstance;

    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<Middleware<TParameters, TReturn, TContext>>,
    ): TInstance;
}

/**
 * The <i>Hooks</i> provides a convenient way to change and inspect arguments and return value of both only sync functions.
 * For example <i>Hooks</i> class can be used to log function arguments and return values. Note this class will always return sync value and is immutable.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Hooks
 */
export class Hooks<
        TParameters extends unknown[] = unknown[],
        TReturn = unknown,
        TContext extends Partial<Record<string, unknown>> = Partial<
            Record<string, unknown>
        >,
    >
    implements
        IInvokableObject<TParameters, TReturn>,
        IHooksAware<
            Hooks<TParameters, TReturn, TContext>,
            TParameters,
            TReturn,
            TContext
        >
{
    private static init<TParameters extends unknown[], TReturn, TContext>(
        invokable: Invokable<TParameters, TReturn>,
        middlewares: OneOrMore<Middleware<TParameters, TReturn, TContext>>,
        context: TContext,
    ): InvokableFn<TParameters, TReturn> {
        let func = resolveInvokable(invokable);
        for (const hook of [...resolveOneOrMore(middlewares)]
            .reverse()
            .map(resolveInvokable)) {
            const prevFunc = func;
            func = (...arguments_: TParameters) =>
                hook(arguments_, prevFunc, context);
        }
        return func;
    }

    private readonly func: InvokableFn<TParameters, TReturn>;

    /**
     * @example
     * ```ts
     * import { Hooks, type Middleware } from "@daiso-tech/core/utilities";
     *
     * function logMiddleware<TParameters extends unknown[], TReturn>(): Middleware<TParameters, TReturn, { funcName: string; }> {
     *   return async (args, next, { funcName }) => {
     *     console.log("FUNCTION_NAME:", funcName);
     *     console.log("ARGUMENTS:", args);
     *     const value = await next(...args);
     *     console.log("RETURN:", value);
     *     return value;
     *   }
     * }
     *
     * function timeMiddleware<TParameters extends unknown[], TReturn>(): Middleware<TParameters, TReturn> {
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
        private readonly invokable: Invokable<TParameters, TReturn>,
        private readonly middlewares: OneOrMore<
            Middleware<TParameters, TReturn, TContext>
        >,
        private readonly context = {} as TContext,
    ) {
        this.func = Hooks.init(invokable, middlewares, context);
    }

    /**
     * The <i>pipe</i> method returns a new <i>Hooks</i> instance with the additional <i>middlewares</i> applied.
     */
    pipe(
        middlewares: OneOrMore<Middleware<TParameters, TReturn, TContext>>,
    ): Hooks<TParameters, TReturn, TContext> {
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
     * The <i>pipeWhen</i> method conditionally applies additional <i>middlewares</i>, returning a new <i>Hooks</i> instance only if the specified condition is met.
     */
    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<Middleware<TParameters, TReturn, TContext>>,
    ): Hooks<TParameters, TReturn, TContext> {
        if (condition) {
            return this.pipe(middlewares);
        }
        return this;
    }

    /**
     * The <i>invoke</i> method executes the constructor's input function, applying all middlewares.
     */
    invoke(...arguments_: TParameters): TReturn {
        return this.func(...arguments_);
    }
}

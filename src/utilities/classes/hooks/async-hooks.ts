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
    type Promisable,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Hooks
 */
export type AsyncMiddleware<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> = Invokable<
    [
        arguments_: TParameters,
        next: InvokableFn<TParameters, Promise<TReturn>>,
        context: TContext,
    ],
    Promise<TReturn>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Hooks
 */
export interface IAsyncHooksAware<
    TInstance,
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends Partial<Record<string, unknown>> = Partial<
        Record<string, unknown>
    >,
> {
    pipe(
        middlewares: OneOrMore<AsyncMiddleware<TParameters, TReturn, TContext>>,
    ): TInstance;

    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<AsyncMiddleware<TParameters, TReturn, TContext>>,
    ): TInstance;
}

/**
 * The <i>AsyncHooks</i> provides a convenient way to change and inspect arguments and return value of both async and sync functions.
 * For example <i>AsyncHooks</i> class can be used to log function arguments and return values. Note this class will always return promise and is immutable.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Hooks
 */
export class AsyncHooks<
        TParameters extends unknown[] = unknown[],
        TReturn = unknown,
        TContext extends Partial<Record<string, unknown>> = Partial<
            Record<string, unknown>
        >,
    >
    implements
        IInvokableObject<TParameters, Promise<TReturn>>,
        IAsyncHooksAware<
            AsyncHooks<TParameters, TReturn, TContext>,
            TParameters,
            TReturn,
            TContext
        >
{
    private static init<TParameters extends unknown[], TReturn, TContext>(
        invokable: Invokable<TParameters, Promisable<TReturn>>,
        middlewares: OneOrMore<AsyncMiddleware<TParameters, TReturn, TContext>>,
        context: TContext,
    ): InvokableFn<TParameters, Promisable<TReturn>> {
        let func = resolveInvokable(invokable);
        for (const hook of [...resolveOneOrMore(middlewares)]
            .reverse()
            .map(resolveInvokable)) {
            const prevFunc = func;
            const next = async (...arguments_: TParameters) =>
                await prevFunc(...arguments_);
            func = async (...arguments_: TParameters) =>
                await hook(arguments_, next, context);
        }
        return func;
    }

    private readonly func: InvokableFn<TParameters, Promisable<TReturn>>;

    /**
     * @example
     * ```ts
     * import { AsyncHooks, type AsyncMiddleware } from "@daiso-tech/core/utilities";
     *
     * function logMiddleware<TParameters extends unknown[], TReturn>(): AsyncMiddleware<TParameters, TReturn, { funcName: string; }> {
     *   return async (args, next, { funcName }) => {
     *     console.log("FUNCTION_NAME:", funcName);
     *     console.log("ARGUMENTS:", args);
     *     const value = await next(...args);
     *     console.log("RETURN:", value);
     *     return value;
     *   }
     * }
     *
     * function timeMiddleware<TParameters extends unknown[], TReturn>(): AsyncMiddleware<TParameters, TReturn> {
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
     * const enhancedAdd = new AsyncHooks(add, [
     *   logMiddleware(),
     *   timeMiddleware()
     * ],
     * // You can provide additional information to <i>AsyncMiddleware</i> invokables.
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
        private readonly invokable: Invokable<TParameters, Promisable<TReturn>>,
        private readonly middlewares: OneOrMore<
            AsyncMiddleware<TParameters, TReturn, TContext>
        >,
        private readonly context = {} as TContext,
    ) {
        this.func = AsyncHooks.init(invokable, middlewares, context);
    }

    /**
     * The <i>pipe</i> method returns a new <i>AsyncHooks</i> instance with the additional <i>middlewares</i> applied.
     */
    pipe(
        middlewares: OneOrMore<AsyncMiddleware<TParameters, TReturn, TContext>>,
    ): AsyncHooks<TParameters, TReturn, TContext> {
        return new AsyncHooks(
            this.invokable,
            [
                ...resolveOneOrMore(this.middlewares),
                ...resolveOneOrMore(middlewares),
            ],
            this.context,
        );
    }

    /**
     * The <i>pipeWhen</i> method conditionally applies additional <i>middlewares</i>, returning a new <i>AsyncHooks</i> instance only if the specified condition is met.
     */
    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<AsyncMiddleware<TParameters, TReturn, TContext>>,
    ): AsyncHooks<TParameters, TReturn, TContext> {
        if (condition) {
            return this.pipe(middlewares);
        }
        return this;
    }

    /**
     * The <i>invoke</i> method executes the constructor's input function, applying all middlewares.
     */
    async invoke(...arguments_: TParameters): Promise<TReturn> {
        return await this.func(...arguments_);
    }
}

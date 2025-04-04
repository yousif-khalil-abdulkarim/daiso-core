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
import type { HookContext } from "@/utilities/classes/hooks/types.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Hooks
 */
export type AsyncNextFunc<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
> = InvokableFn<TParameters, PromiseLike<TReturn>>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Hooks
 */
export type AsyncMiddlewareFn<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> = InvokableFn<
    [
        arguments_: TParameters,
        next: AsyncNextFunc<TParameters, TReturn>,
        context: TContext,
    ],
    Promisable<TReturn>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Hooks
 */
export type IAsyncMiddlewareObject<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> = IInvokableObject<
    [
        arguments_: TParameters,
        next: AsyncNextFunc<TParameters, TReturn>,
        context: TContext,
    ],
    Promisable<TReturn>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Hooks
 */
export type AsyncMiddleware<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> =
    | IAsyncMiddlewareObject<TParameters, TReturn, TContext>
    | AsyncMiddlewareFn<TParameters, TReturn, TContext>;

/**
 * The `AsyncHooks` class provides a convenient way to change and inspect arguments and return value of both async and sync functions.
 * For example `AsyncHooks` class can be used to log function arguments and return values. Note this class will always return promise and is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Hooks
 */
export class AsyncHooks<
    TParameters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext extends HookContext = HookContext,
> implements IInvokableObject<TParameters, Promise<TReturn>>
{
    private static init<TParameters extends unknown[], TReturn, TContext>(
        invokable: Invokable<TParameters, Promisable<TReturn>>,
        middlewares: OneOrMore<AsyncMiddleware<TParameters, TReturn, TContext>>,
        context: TContext,
    ): InvokableFn<TParameters, Promisable<TReturn>> {
        let func = resolveInvokable(invokable);
        for (const hook of resolveOneOrMore(middlewares)
            .map(resolveInvokable)
            .reverse()) {
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
     * import { AsyncHooks, type AsyncMiddlewareFn } from "@daiso-tech/core/utilities";
     *
     * function log<TParameters extends unknown[], TReturn>(): AsyncMiddlewareFn<TParameters, TReturn, { funcName: string; }> {
     *   return async (args, next, { funcName }) => {
     *     console.log("FUNCTION_NAME:", funcName);
     *     console.log("ARGUMENTS:", args);
     *     const value = await next(...args);
     *     console.log("RETURN:", value);
     *     return value;
     *   }
     * }
     *
     * function time<TParameters extends unknown[], TReturn>(): AsyncMiddlewareFn<TParameters, TReturn> {
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
     *   log(),
     *   time()
     * ],
     * // You can provide additional information to `AsyncMiddleware` invokables.
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
        private readonly middlewares: NoInfer<
            OneOrMore<AsyncMiddleware<TParameters, TReturn, TContext>>
        >,
        /**
         * You can pass in additional information that can be used by the middleware.
         */
        private readonly context = {} as TContext,
    ) {
        this.func = AsyncHooks.init(invokable, middlewares, context);
    }

    /**
     * The `pipe` method returns a new `AsyncHooks` instance with the additional `middlewares` applied.
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
     * The `pipeWhen` method conditionally applies additional `middlewares`, returning a new `AsyncHooks` instance only if the specified condition is met.
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
     * The `toFunc` will return the function with all middlewares applied.
     */
    toFunc(): InvokableFn<TParameters, PromiseLike<TReturn>> {
        return (...args) => this.invoke(...args);
    }

    /**
     * The `invoke` method executes the constructor's input function, applying all middlewares.
     */
    async invoke(...arguments_: TParameters): Promise<TReturn> {
        return await this.func(...arguments_);
    }
}

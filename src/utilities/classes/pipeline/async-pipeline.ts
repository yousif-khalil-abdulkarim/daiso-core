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
 * @group Pipe
 */
export type AsyncPipe<
    TParamters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> = Invokable<
    [
        arguments_: TParamters,
        next: InvokableFn<TParamters, Promisable<TReturn>>,
        context: TContext,
    ],
    Promisable<TReturn>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Pipe
 */
export class AsyncPipeline<
    TParamters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> implements IInvokableObject<TParamters, Promise<TReturn>>
{
    private static init<TParamters extends unknown[], TReturn, TContext>(
        invokable: Invokable<TParamters, Promisable<TReturn>>,
        pipes: OneOrMore<AsyncPipe<TParamters, TReturn, TContext>>,
        context: TContext,
    ): InvokableFn<TParamters, Promisable<TReturn>> {
        let func = resolveInvokable(invokable);
        for (const pipe of [...resolveOneOrMore(pipes)]
            .reverse()
            .map(resolveInvokable)) {
            const prevFunc = func;
            func = async (...arguments_: TParamters) =>
                await pipe(arguments_, prevFunc, context);
        }
        return func;
    }

    private readonly func: InvokableFn<TParamters, Promisable<TReturn>>;

    constructor(
        private readonly invokable: Invokable<TParamters, Promisable<TReturn>>,
        private readonly pipes: OneOrMore<
            AsyncPipe<TParamters, TReturn, TContext>
        >,
        private readonly context = {} as TContext,
    ) {
        this.func = AsyncPipeline.init(invokable, pipes, context);
    }

    add(
        pipes: OneOrMore<AsyncPipe<TParamters, TReturn, TContext>>,
    ): AsyncPipeline<TParamters, TReturn, TContext> {
        return new AsyncPipeline(
            this.invokable,
            [...resolveOneOrMore(this.pipes), ...resolveOneOrMore(pipes)],
            this.context,
        );
    }

    addWhen(
        condition: boolean,
        pipes: OneOrMore<AsyncPipe<TParamters, TReturn, TContext>>,
    ): AsyncPipeline<TParamters, TReturn, TContext> {
        if (condition) {
            return this.add(pipes);
        }
        return this;
    }

    async invoke(...arguments_: TParamters): Promise<TReturn> {
        return await this.func(...arguments_);
    }
}

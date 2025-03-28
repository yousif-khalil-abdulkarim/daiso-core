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
 * @group Pipe
 */
export type Pipe<
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Pipe
 */
export class Pipeline<
    TParamters extends unknown[] = unknown[],
    TReturn = unknown,
    TContext = object,
> implements IInvokableObject<TParamters, TReturn>
{
    private static init<TParamters extends unknown[], TReturn, TContext>(
        invokable: Invokable<TParamters, TReturn>,
        pipes: OneOrMore<Pipe<TParamters, TReturn, TContext>>,
        context: TContext,
    ): InvokableFn<TParamters, TReturn> {
        let func = resolveInvokable(invokable);
        for (const pipe of [...resolveOneOrMore(pipes)]
            .reverse()
            .map(resolveInvokable)) {
            const prevFunc = func;
            func = (...arguments_: TParamters) =>
                pipe(arguments_, prevFunc, context);
        }
        return func;
    }

    private readonly func: InvokableFn<TParamters, TReturn>;

    constructor(
        private readonly invokable: Invokable<TParamters, TReturn>,
        private readonly pipes: OneOrMore<Pipe<TParamters, TReturn, TContext>>,
        private readonly context = {} as TContext,
    ) {
        this.func = Pipeline.init(invokable, pipes, context);
    }

    add(
        pipes: OneOrMore<Pipe<TParamters, TReturn, TContext>>,
    ): Pipeline<TParamters, TReturn, TContext> {
        return new Pipeline(
            this.invokable,
            [...resolveOneOrMore(this.pipes), ...resolveOneOrMore(pipes)],
            this.context,
        );
    }

    addWhen(
        condition: boolean,
        pipes: OneOrMore<Pipe<TParamters, TReturn, TContext>>,
    ): Pipeline<TParamters, TReturn, TContext> {
        if (condition) {
            return this.add(pipes);
        }
        return this;
    }

    invoke(...arguments_: TParamters): TReturn {
        return this.func(...arguments_);
    }
}

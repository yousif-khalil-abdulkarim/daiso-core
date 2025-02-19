/**
 * @module Utilities
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type { Invokable } from "@/utilities/types.js";

/**
 * The <i>Pipeline</i> class provides a convenient way to pipe multiple functions and <i>{@link IInvokableObject}</i>,
 * giving each functions and <i>{@link IInvokableObject}</i> the opportunity to inspect or modify the input.
 * Pipeline class is immutable meaning you can extend it without causing problems.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export class Pipeline<TInitial, TPrev = TInitial, TCurrent = TPrev> {
    /**
     * @example
     * ```ts
     * import { Pipeline, type IInvokableObject } from "@daiso-tech/core/utilities";
     *
     * const isEmpty = Pipeline
     *   // You must define the initial argument type
     *   .start<string>()
     *   // You can extract the function if you want.
     *   // You can also pass in an object that implements IInvokableObject contract
     *   .pipe(value => return value.length)
     *   .pipe(value => value === 0);
     *
     * // You can extend the previous pipeline
     * const isNotEmpty = isEmpty.pipe(isEmpty => !isEmpty);
     *
     * const result1 = await isEmpty.execute("");
     * // false
     * console.log(result1);
     *
     * const result2 = await isEmpty.execute("asdasd");
     * // false
     * console.log(result2);
     * ```
     */
    static start<TValue>(): Pipeline<TValue> {
        return new Pipeline();
    }

    private static async execute<TInput, TOutput>(
        value: TInput,
        pipe: Invokable<TInput, TOutput>,
    ): Promise<TOutput> {
        if (typeof pipe === "function") {
            return await pipe(value);
        }
        return pipe.handler(value);
    }

    private readonly pipes: Invokable<any, any>[] = [];

    private constructor(pipe?: Invokable<any, any>) {
        if (pipe !== undefined) {
            this.pipes = [...this.pipes, pipe];
        }
    }

    pipe<TInput extends TCurrent, TOutput>(
        pipe: Invokable<TInput, TOutput>,
    ): Pipeline<TInitial, TCurrent, TOutput> {
        return new Pipeline(pipe);
    }

    execute(value: TInitial): LazyPromise<TCurrent> {
        return new LazyPromise(async () => {
            const [pipe, ...pipes] = this.pipes;
            if (pipe === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return value as any;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            let value_: TCurrent = await Pipeline.execute(value, pipe);
            for (const pipe of pipes) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value_ = await Pipeline.execute(value, pipe);
            }
            return value_;
        });
    }
}

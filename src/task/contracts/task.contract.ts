/**
 * @module Task
 */
import { type AsyncLazyable, type OneOrMore } from "@/utilities/_module.js";
import { type AsyncMiddleware } from "@/hooks/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/task/contracts"`
 * @group Contracts
 */
export type ITask<TValue> = PromiseLike<TValue> & {
    pipeWhen(
        condition: AsyncLazyable<boolean>,
        middlewares: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): ITask<TValue>;

    /**
     * The `pipe` method returns a new `ITask` instance with the additional `middlewares` applied.
     */
    pipe(middlewares: OneOrMore<AsyncMiddleware<[], TValue>>): ITask<TValue>;

    /**
     * The `detach` method executes the `ITask` without awaiting it.
     */
    detach(): void;
};

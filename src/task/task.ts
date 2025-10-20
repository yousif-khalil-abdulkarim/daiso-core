/**
 * @module Task
 */
import {
    type AsyncLazy,
    type Invokable,
    type InvokableFn,
    type OneOrMore,
    type Promisable,
    callInvokable,
    isPromiseLike,
    resolveAsyncLazyable,
} from "@/utilities/_module-exports.js";
import { abortAndFail } from "@/task/abort-and-fail.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import { AsyncHooks, type AsyncMiddleware } from "@/hooks/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/task"`
 */
export type TaskResolve<TValue> = InvokableFn<
    [value: Promisable<TValue>],
    void
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/task"`
 */
export type TaskReject = InvokableFn<[error: unknown], void>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/task"`
 */
export type TaskCallback<TValue> = InvokableFn<
    [resolve: TaskResolve<TValue>, reject: TaskReject],
    Promisable<void>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/task"`
 */
export type TaskAllResult<T extends readonly unknown[]> = {
    -readonly [P in keyof T]: Awaited<T[P]>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/task"`
 */
export type TaskAllSettledResult<T extends readonly unknown[]> = {
    -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>;
};

/**
 * The `Task` class is used for creating lazy {@link PromiseLike | `PromiseLike`} object that will only execute when awaited or when `then` method is called.
 * Note the class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/task"`
 */
export class Task<TValue> implements PromiseLike<TValue> {
    /**
     * The `wrapFn` is convience method used for wrapping async {@link Invokable | `Invokable`} with a `Task`.
     * @example
     * ```ts
     * import { Task, retry } from "@daiso-tech/core/task";
     * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
     * import { readFile as readFileNodeJs } from "node:fs/promises";
     *
     * const readFile = Task.wrapFn(readFileNodeJs);
     *
     * const file = await readFile("none_existing_file.txt");
     * ```
     */
    static wrapFn<TArgs extends unknown[], TReturn>(
        fn: Invokable<TArgs, Promisable<TReturn>>,
    ): InvokableFn<TArgs, Task<TReturn>> {
        return (...parameters) =>
            new Task<TReturn>(() => callInvokable(fn, ...parameters));
    }

    /**
     * The `delay` method creates a {@link Task | `Task`} that will be fulfilled after given `time`.
     *
     * @example
     * ```ts
     * import { Task } from "@daiso-tech/core/task";
     * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
     *
     * console.log("a");
     * await Task.delay(TimeSpan.fromSeconds(2));
     * console.log("b");
     * ```
     */
    static delay(
        time: ITimeSpan,
        abortSignal: AbortSignal = new AbortController().signal,
    ): Task<void> {
        return new Task(async () => {
            let timeoutId = null as NodeJS.Timeout | string | number | null;
            try {
                await abortAndFail(
                    new Promise<void>((resolve) => {
                        timeoutId = setTimeout(() => {
                            resolve();
                        }, TimeSpan.fromTimeSpan(time).toMilliseconds());
                    }),
                    abortSignal,
                );
            } finally {
                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                }
            }
        });
    }

    /**
     * The `resolve` method works similarly to {@link Promise.resolve | `Promise.resolve`} with the key distinction that it operates lazily.
     */
    static resolve<TValue>(value: TValue | Task<TValue>): Task<TValue>;

    /**
     * The `resolve` method works similarly to {@link Promise.resolve | `Promise.resolve`} with the key distinction that it operates lazily.
     */
    static resolve(): Task<void>;

    /**
     * The `resolve` method works similarly to {@link Promise.resolve | `Promise.resolve`} with the key distinction that it operates lazily.
     */
    static resolve<TValue>(value?: TValue | Task<TValue>): Task<TValue | void> {
        return new Task<TValue | void>(async () => {
            if (value === undefined) {
                return;
            }
            return await value;
        });
    }

    /**
     * The `reject` method works similarly to {@link Promise.reject | `Promise.reject`} with the key distinction that it operates lazily.
     */
    static reject<TValue = never, TError = unknown>(
        reason?: TError,
    ): Task<TValue> {
        return new Task<TValue>(async () => {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            return Promise.reject(reason);
        });
    }

    private static toTasks<TValue>(
        promises: Iterable<TValue | PromiseLike<TValue>>,
    ): Task<TValue>[] {
        const tasks: Task<TValue>[] = [];
        for (const promise of promises) {
            if (promise instanceof Task) {
                tasks.push(promise as Task<TValue>);
            }
            if (!isPromiseLike(promise)) {
                tasks.push(Task.resolve(promise));
            }
            throw new TypeError("!!__MESSAGE__!!");
        }
        return tasks;
    }

    /**
     * The `all` method works similarly to {@link Promise.all | `Promise.all`} with the key distinction that it operates lazily.
     */
    static all<TValue extends readonly unknown[] | []>(
        tasks: TValue,
    ): Task<TaskAllResult<TValue>>;

    /**
     * The `all` method works similarly to {@link Promise.all | `Promise.all`} with the key distinction that it operates lazily.
     */
    static all<TValue>(
        tasks: Iterable<TValue | Task<TValue>>,
    ): Task<Awaited<TValue>[]>;

    /**
     * The `all` method works similarly to {@link Promise.all | `Promise.all`} with the key distinction that it operates lazily.
     */
    static all<TValue>(
        tasks: Iterable<TValue | PromiseLike<TValue>>,
    ): Task<TValue[]> {
        return new Task<TValue[]>(async () => Promise.all(Task.toTasks(tasks)));
    }

    /**
     * The `allSettled` method works similarly to {@link Promise.allSettled | `Promise.allSettled`} with the key distinction that it operates lazily.
     */
    static allSettled<TValues extends readonly unknown[] | []>(
        tasks: TValues,
    ): Task<TaskAllSettledResult<TValues>>;

    /**
     * The `allSettled` method works similarly to {@link Promise.allSettled | `Promise.allSettled`} with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        tasks: Iterable<Task<TValue>>,
    ): Task<PromiseSettledResult<TValue>[]>;

    /**
     * The `allSettled` method works similarly to {@link Promise.allSettled | `Promise.allSettled`} with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        tasks: Iterable<TValue | PromiseLike<TValue>>,
    ): Task<PromiseSettledResult<TValue>[]> {
        return new Task<PromiseSettledResult<TValue>[]>(async () =>
            Promise.allSettled(Task.toTasks(tasks)),
        );
    }

    /**
     * The `race` method works similarly to {@link Promise.race | `Promise.race`} with the key distinction that it operates lazily.
     */
    static race<T extends readonly unknown[] | []>(
        tasks: T,
    ): Task<Awaited<T[number]>>;

    /**
     * The `race` method works similarly to {@link Promise.race | `Promise.race`} with the key distinction that it operates lazily.
     */
    static race<TValue>(tasks: Iterable<TValue | Task<TValue>>): Task<TValue>;

    /**
     * The `race` method works similarly to {@link Promise.race | `Promise.race`} with the key distinction that it operates lazily.
     */
    static race<TValue>(
        tasks: Iterable<TValue | PromiseLike<TValue>>,
    ): Task<TValue> {
        return new Task(async () => Promise.race(Task.toTasks(tasks)));
    }

    /**
     * The `any` method works similarly to {@link Promise.any | `Promise.any`} with the key distinction that it operates lazily.
     */
    static any<T extends readonly unknown[] | []>(
        tasks: T,
    ): Task<Awaited<T[number]>>;

    /**
     * The `any` method works similarly to {@link Promise.any | `Promise.any`} with the key distinction that it operates lazily.
     */
    static any<TValue>(tasks: Iterable<TValue | Task<TValue>>): Task<TValue>;

    /**
     * The `any` method works similarly to {@link Promise.any | `Promise.any`} with the key distinction that it operates lazily.
     */
    static any<TValue>(
        tasks: Iterable<TValue | PromiseLike<TValue>>,
    ): Task<TValue> {
        return new Task(async () => Promise.any(Task.toTasks(tasks)));
    }

    /**
     * The `fromCallback` is convience method used for wrapping Node js callback functions with a `Task`.
     * @example
     * ```ts
     * import { Task } from "@daiso-tech/core/task";
     * import { readFile } from "node:fs";
     *
     * const task = Task.fromCallback<Buffer  | string>((resolve, reject) => {
     *   readFile("FILE_PATH", (err, data) => {
     *     if (err !== null) {
     *       reject(err);
     *       return;
     *     }
     *     resolve(data);
     *   });
     * });
     * const file = await task;
     * console.log(file);
     * ```
     */
    static fromCallback<TValue>(callback: TaskCallback<TValue>): Task<TValue> {
        return new Task(
            () =>
                new Promise((resolve, reject) => {
                    callback(resolve, reject);
                }),
        );
    }

    private promise: PromiseLike<TValue> | null = null;
    private readonly invokable: AsyncHooks<[], TValue>;

    /**
     * @example
     * ```ts
     * import { Task, retry } from "@daiso-tech/core/task";
     *
     * const promise = new Task(async () => {
     *   console.log("I am lazy");
     * },
     *   // You can also pass in one AsyncMiddleware or multiple (as an Array).
     *   retry()
     * );
     *
     * // "I am lazy" will only logged when awaited or then method i called.
     * await promise;
     * ```
     *
     * You can pass sync or async {@link Invokable | `Invokable`}.
     */
    constructor(
        invokable: AsyncLazy<TValue>,
        middlewares: OneOrMore<AsyncMiddleware<[], TValue>> = [],
    ) {
        this.invokable = new AsyncHooks(async () => {
            return await resolveAsyncLazyable(invokable);
        }, middlewares);
    }

    /**
     * The `pipe` method returns a new `Task` instance with the additional `middlewares` applied.
     */
    pipe(middlewares: OneOrMore<AsyncMiddleware<[], TValue>>): Task<TValue> {
        return new Task(this.invokable.pipe(middlewares));
    }

    /**
     * The `pipeWhen` method conditionally applies additional `middlewares`, returning a new `Task` instance only if the specified condition is met.
     */
    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): Task<TValue> {
        return new Task(this.invokable.pipeWhen(condition, middlewares));
    }

    then<TResult1 = TValue, TResult2 = never>(
        onfulfilled?:
            | ((value: TValue) => TResult1 | PromiseLike<TResult1>)
            | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        if (this.promise === null) {
            this.promise = this.invokable.invoke();
        }
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
        return this.promise.then(onfulfilled, onrejected);
    }

    /**
     * The `detach` method executes the `Task` without awaiting it.
     * @example
     * ```ts
     * import { Task } from "@daiso-tech/core/task";
     * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
     *
     * const promise =
     *   new Task(async () => {
     *     await Task.delay(TimeSpan.fromSeconds(1));
     *     // Will be loged after one second
     *     console.log("Done !");
     *   });
     *
     * promise.detach();
     *
     * // Will be logged immediately
     * console.log("Hello");
     * await Task.delay(TimeSpan.fromSeconds(2));
     * ```
     */
    detach(): void {
        this.then(() => {});
    }
}

/**
 * @module Async
 */
import {
    type AsyncLazy,
    type Invokable,
    type InvokableFn,
    type OneOrMore,
    type Promisable,
    callInvokable,
    resolveAsyncLazyable,
} from "@/utilities/_module-exports.js";
import { abortAndFail } from "@/async/utilities/abort-and-fail/_module.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import { AsyncHooks, type AsyncMiddleware } from "@/hooks/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseResolve<TValue> = InvokableFn<
    [value: Promisable<TValue>],
    void
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseReject = InvokableFn<[error: unknown], void>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseCallback<TValue> = InvokableFn<
    [
        resolve: LazyPromiseResolve<TValue>,
        // (value: TValue) => void,
        reject: LazyPromiseReject,
    ],
    Promisable<void>
>;

/**
 * The `LazyPromise` class is used for creating lazy {@link PromiseLike | `PromiseLike`} object that will only execute when awaited or when `then` method is called.
 * Note the class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export class LazyPromise<TValue> implements PromiseLike<TValue> {
    /**
     * The `wrapFn` is convience method used for wrapping async {@link Invokable | `Invokable`} with a `LazyPromise`.
     * @example
     * ```ts
     * import { LazyPromise, retry } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
     * import { readFile as readFileNodeJs } from "node:fs/promises";
     *
     * const readFile = LazyPromise.wrapFn(readFileNodeJs);
     *
     * const file = await readFile("none_existing_file.txt");
     * ```
     */
    static wrapFn<TArgs extends unknown[], TReturn>(
        fn: Invokable<TArgs, Promisable<TReturn>>,
    ): InvokableFn<TArgs, LazyPromise<TReturn>> {
        return (...parameters) =>
            new LazyPromise<TReturn>(() => callInvokable(fn, ...parameters));
    }

    /**
     * The `delay` method creates a {@link LazyPromise | `LazyPromise`} that will be fulfilled after given `time`.
     *
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
     *
     * console.log("a");
     * await LazyPromise.delay(TimeSpan.fromSeconds(2));
     * console.log("b");
     * ```
     */
    static delay(
        time: ITimeSpan,
        abortSignal: AbortSignal = new AbortController().signal,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
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
     * The `all` method works similarly to {@link Promise.all | `Promise.all`} with the key distinction that it operates lazily.
     */
    static all<TValue>(promises: LazyPromise<TValue>[]): LazyPromise<TValue[]> {
        return new LazyPromise<TValue[]>(async () => Promise.all(promises));
    }

    /**
     * The `allSettled` method works similarly to {@link Promise.allSettled | `Promise.allSettled`} with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        promises: LazyPromise<TValue>[],
    ): LazyPromise<PromiseSettledResult<TValue>[]> {
        return new LazyPromise<PromiseSettledResult<TValue>[]>(async () =>
            Promise.allSettled(promises),
        );
    }

    /**
     * The `race` method works similarly to {@link Promise.race | `Promise.race`} with the key distinction that it operates lazily.
     */
    static race<TValue>(promises: LazyPromise<TValue>[]): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.race(promises));
    }

    /**
     * The `any` method works similarly to {@link Promise.any | `Promise.any`} with the key distinction that it operates lazily.
     */
    static any<TValue>(promises: LazyPromise<TValue>[]): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.any(promises));
    }

    /**
     * The `fromCallback` is convience method used for wrapping Node js callback functions with a `LazyPromise`.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { readFile } from "node:fs";
     *
     * const lazyPromise = LazyPromise.fromCallback<Buffer  | string>((resolve, reject) => {
     *   readFile("FILE_PATH", (err, data) => {
     *     if (err !== null) {
     *       reject(err);
     *       return;
     *     }
     *     resolve(data);
     *   });
     * });
     * const file = await lazyPromise;
     * console.log(file);
     * ```
     */
    static fromCallback<TValue>(
        callback: LazyPromiseCallback<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(
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
     * import { LazyPromise, retry } from "@daiso-tech/core/async";
     *
     * const promise = new LazyPromise(async () => {
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
        this.invokable = new AsyncHooks(
            () => resolveAsyncLazyable(invokable),
            middlewares,
        );
    }

    /**
     * The `pipe` method returns a new `LazyPromise` instance with the additional `middlewares` applied.
     */
    pipe(
        middlewares: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(this.invokable.pipe(middlewares));
    }

    /**
     * The `pipeWhen` method conditionally applies additional `middlewares`, returning a new `LazyPromise` instance only if the specified condition is met.
     */
    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(this.invokable.pipeWhen(condition, middlewares));
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
     * The `defer` method executes the `LazyPromise` without awaiting it.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     await LazyPromise.delay(TimeSpan.fromSeconds(1));
     *     // Will be loged after one second
     *     console.log("Done !");
     *   });
     *
     * promise.defer();
     *
     * // Will be logged immediately
     * console.log("Hello");
     * await LazyPromise.delay(TimeSpan.fromSeconds(2));
     * ```
     */
    defer(): void {
        this.then(() => {});
    }
}

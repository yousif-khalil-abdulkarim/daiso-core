/**
 * @module Async
 */
import {
    AsyncHooks,
    type AsyncLazy,
    type AsyncMiddleware,
    type IAsyncHooksAware,
    type Invokable,
    type InvokableFn,
    type OneOrMore,
    type Promisable,
    type TimeSpan,
    callInvokable,
    resolveAsyncLazyable,
} from "@/utilities/_module-exports.js";
import { abortAndFail } from "@/async/utilities/abort-and-fail/_module.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseResolve<TValue> = InvokableFn<
    [value: Promisable<TValue>],
    void
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseReject = InvokableFn<[error: unknown], void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
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
 * The <i>LazyPromise</i> class is used for creating lazy <i>{@link PromiseLike}<i> object that will only execute when awaited or when <i>then</i> method is called.
 * Note the class is immutable.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class LazyPromise<TValue>
    implements
        PromiseLike<TValue>,
        IAsyncHooksAware<LazyPromise<TValue>, [], TValue>
{
    /**
     * The <i>wrapFn</i> is convience method used for wrapping async <i>{@link Invokable}</i> with a <i>LazyPromise</i>.
     * @example
     * ```ts
     * import { LazyPromise, retryMiddleware } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { readFile as readFileNodeJs } from "node:fs/promises";
     *
     * const readFile = LazyPromise.wrapFn(readFileNodeJs);
     *
     * const file = await readFile("none_existing_file.txt")
     *   .pipe(
     *     // You can also pass in one AsyncMiddleware or multiple (as an Array).
     *     retryMiddleware({
     *       maxAttempts: 8
     *     })
     *   );
     * ```
     */
    static wrapFn<TArgs extends unknown[], TReturn>(
        fn: Invokable<TArgs, Promisable<TReturn>>,
        middlewares?: OneOrMore<AsyncMiddleware<[], TReturn>>,
    ): InvokableFn<TArgs, LazyPromise<TReturn>> {
        return (...parameters) =>
            new LazyPromise<TReturn>(
                () => callInvokable(fn, ...parameters),
                middlewares,
            );
    }

    /**
     * The <i>delay</i> method creates a <i>{@link LazyPromise}</i> that will be fulfilled after given <i>time</i>.
     *
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * console.log("a");
     * await LazyPromise.delay(TimeSpan.fromSeconds(2));
     * console.log("b");
     * ```
     */
    static delay(
        time: TimeSpan,
        abortSignal: AbortSignal = new AbortController().signal,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            let timeoutId = null as NodeJS.Timeout | string | number | null;
            try {
                await abortAndFail(
                    new Promise<void>((resolve) => {
                        timeoutId = setTimeout(() => {
                            resolve();
                        }, time.toMilliseconds());
                    }),
                    abortSignal,
                );
            } finally {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                }
            }
        });
    }

    /**
     * The <i>all<i> method works similarly to <i>{@link Promise.all}</i> with the key distinction that it operates lazily.
     */
    static all<TValue>(
        promises: LazyPromise<TValue>[],
        middlewares?: OneOrMore<AsyncMiddleware<[], TValue[]>>,
    ): LazyPromise<TValue[]> {
        return new LazyPromise<TValue[]>(
            async () => Promise.all(promises),
            middlewares,
        );
    }

    /**
     * The <i>allSettled<i> method works similarly to <i>{@link Promise.allSettled}</i> with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        promises: LazyPromise<TValue>[],
        middlewares?: OneOrMore<
            AsyncMiddleware<[], PromiseSettledResult<TValue>[]>
        >,
    ): LazyPromise<PromiseSettledResult<TValue>[]> {
        return new LazyPromise<PromiseSettledResult<TValue>[]>(
            async () => Promise.allSettled(promises),
            middlewares,
        );
    }

    /**
     * The <i>race<i> method works similarly to <i>{@link Promise.race}</i> with the key distinction that it operates lazily.
     */
    static race<TValue>(
        promises: LazyPromise<TValue>[],
        middlewares?: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.race(promises), middlewares);
    }

    /**
     * The <i>any<i> method works similarly to <i>{@link Promise.any}</i> with the key distinction that it operates lazily.
     */
    static any<TValue>(
        promises: LazyPromise<TValue>[],
        middlewares?: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.any(promises), middlewares);
    }

    /**
     * The <i>fromCallback</i> is convience method used for wrapping Node js callback functions with a <i>LazyPromise</i>.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { readFile } from "node:fs";
     *
     * const lazyPromise = LazyPromise.fromCallback<Buffer>((resolve, reject) => {
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
        middlewares?: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(
            () =>
                new Promise((resolve, reject) => {
                    callback(resolve, reject);
                }),
            middlewares,
        );
    }

    private promise: PromiseLike<TValue> | null = null;
    private readonly invokable: AsyncHooks<[], TValue>;

    /**
     * @example
     * ```ts
     * import { LazyPromise, retryMiddleware } from "@daiso-tech/core/async";
     *
     * const promise = new LazyPromise(async () => {
     *   console.log("I am lazy");
     * },
     *   // You can also pass in one AsyncMiddleware or multiple (as an Array).
     *   retryMiddleware()
     * );
     *
     * // "I am lazy" will only logged when awaited or then method i called.
     * await promise;
     * ```
     *
     * You can pass sync or async <i>{@link Invokable}</i>.
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
     * The <i>pipe</i> method returns a new <i>LazyPromise</i> instance with the additional <i>middlewares</i> applied.
     */
    pipe(
        middlewares: OneOrMore<AsyncMiddleware<[], TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(this.invokable.pipe(middlewares));
    }

    /**
     * The <i>pipeWhen</i> method conditionally applies additional <i>middlewares</i>, returning a new <i>LazyPromise</i> instance only if the specified condition is met.
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
     * The <i>defer</i> method executes the <i>LazyPromise</i> without awaiting it.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
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

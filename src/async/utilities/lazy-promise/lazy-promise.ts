/**
 * @module Async
 */
import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    AsyncHooks,
    callInvokable,
    getInvokableName,
    isInvokable,
    UnexpectedError,
    type AsyncMiddleware,
    type Invokable,
    type InvokableFn,
    type OneOrMore,
    type Promisable,
} from "@/utilities/_module-exports.js";
import { abortAndFail } from "@/async/utilities/abort-and-fail/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseResolve<TValue = unknown> = InvokableFn<
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
export type LazyPromiseCallback<TValue = unknown> = InvokableFn<
    [
        resolve: LazyPromiseResolve<TValue>,
        reject: LazyPromiseReject,
        signal: AbortSignal,
    ],
    Promisable<void>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseHandler<TValue = unknown> =
    | Invokable<[signal: AbortSignal], Promisable<TValue>>
    | LazyPromise<TValue>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseInvokableParameters<
    TParameters extends unknown[] = any,
> = [...args: TParameters, signal: AbortSignal];

/**
 * `LazyPromiseInvokableFn` is the internal representation of {@link LazyPromise | `LazyPromise`}.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseInvokableFn<
    TParameters extends unknown[] = any,
    TReturn = unknown,
> = InvokableFn<
    LazyPromiseInvokableParameters<TParameters>,
    Promisable<TReturn>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseMiddleware<
    TValue = unknown,
    TParameters extends unknown[] = any,
> = AsyncMiddleware<LazyPromiseInvokableParameters<TParameters>, TValue>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseSettings<
    TValue = unknown,
    TParameters extends unknown[] = any,
> = {
    /**
     * You can add initial middlewares to the {@link LazyPromise | `LazyPromise`}.
     */
    middlewares?: OneOrMore<LazyPromiseMiddleware<TValue, TParameters>>;

    /**
     * You can set the name of the internal function used inside the {@link LazyPromise | `LazyPromise`}.
     * The name can be accessed afterwards inside the applied {@link AsyncMiddleware | `AsyncMiddleware:s`}.
     */
    name?: string;

    /**
     * You can set the args of the internal function used inside the {@link LazyPromise | `LazyPromise`}.
     * The args can be accessed afterwards inside the applied {@link AsyncMiddleware | `AsyncMiddleware:s`}.
     */
    args?: TParameters;

    /**
     * @default
     * ```ts
     * new AbortController().signal
     * ```
     */
    signal?: AbortSignal;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseCreateFnSettings<
    TParameters extends unknown[] = any,
    TReturn = unknown,
> = {
    /**
     * You can add initial middlewares to the {@link LazyPromise | `LazyPromise`}.
     */
    middlewares?: OneOrMore<LazyPromiseMiddleware<TReturn, TParameters>>;

    /**
     * You can set the name of the internal function used inside the {@link LazyPromise | `LazyPromise`}.
     * The name can be accessed afterwards inside the applied {@link AsyncMiddleware | `AsyncMiddleware:s`}.
     */
    name?: string;
};

/**
 * The `LazyPromise` class is used for creating lazy {@link PromiseLike | `PromiseLike`} object that will only execute when awaited or when `then` or `defer` methods are called.
 * Internally, `LazyPromise` is a function that takes at least one argument, where the last argument is always an `AbortSignal`.
 * This function is wrapped in {@link AsyncHooks | AsyncHooks}, allowing you to extend its functionality through {@link AsyncMiddleware | `AsyncMiddleware:s`}.
 *
 * Note the class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export class LazyPromise<TValue = unknown, TParameters extends unknown[] = any>
    implements PromiseLike<TValue>
{
    private static getSignalArg(args: unknown[]): AbortSignal {
        const signal = args.at(-1);
        if (!(signal instanceof AbortSignal)) {
            throw new UnexpectedError("Last argument must be AbortSignal");
        }
        return signal;
    }

    private static setSignalArg(args: unknown[], signal: AbortSignal): void {
        if (!(args.at(-1) instanceof AbortSignal)) {
            throw new UnexpectedError("Last argument must be AbortSignal");
        }
        args[args.length - 1] = signal;
    }

    /**
     * The `createFn` method allows for easily creating a function that returns a {@link LazyPromise | `LazyPromise`}.
     * When creating the function you are provided access to an `AbortSignal`, allowing you to react to external abort requests.
     * For example you can use it with `timeout` middleware to abort a `fetch` call when certain time is exceeded.
     *
     * @example
     * ```ts
     * import { LazyPromise, timeout, retry } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * const fetchData = LazyPromise.createFn((url: string, signal: AbortSignal) => {
     *   const response = await fetch(url, {
     *     signal,
     *     method: "GET"
     *   });
     *   const json = await response.json();
     *   if (!response.ok) {
     *     throw json;
     *   }
     *   return json;
     * });
     *
     * // Note the created function cannot be passed an AbortSignal. If you want to abort the function you need to use a middleware.
     * const data = await fetchData("ENPOINT").pipe([
     *     timeout(TimeSpan.fromSeconds(2)),
     *     retry({ maxAttempts: 4 })
     * ]);
     * ```
     */
    static createFn<TParameters extends unknown[] = [], TReturn = unknown>(
        invokable: LazyPromiseInvokableFn<TParameters, TReturn>,
        settings: LazyPromiseCreateFnSettings<TParameters, TReturn> = {},
    ): InvokableFn<TParameters, LazyPromise<TReturn, TParameters>> {
        const { name = getInvokableName(invokable), middlewares } = settings;
        return (...args: TParameters): LazyPromise<TReturn, TParameters> => {
            return new LazyPromise(
                async (signal) => {
                    return await callInvokable(invokable, ...[...args, signal]);
                },
                {
                    name,
                    args,
                    middlewares,
                },
            );
        };
    }

    /**
     * The `delay` method creates a {@link LazyPromise | `LazyPromise`} that will be fulfilled after given `time`.
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
        settings: LazyPromiseSettings<void> = {},
    ): LazyPromise<void> {
        const {
            name,
            signal = new AbortController().signal,
            middlewares = [],
        } = settings;
        return new LazyPromise<void>(
            async (signal) => {
                let timeoutId = null as NodeJS.Timeout | string | number | null;
                try {
                    await abortAndFail(
                        new Promise<void>((resolve) => {
                            timeoutId = setTimeout(() => {
                                resolve();
                            }, time.toMilliseconds());
                        }),
                        signal,
                    );
                } finally {
                    if (timeoutId !== null) {
                        clearTimeout(timeoutId);
                    }
                }
            },
            {
                name,
                signal,
                middlewares,
            },
        );
    }

    /**
     * The `all` method works similarly to {@link Promise.all | `Promise.all`} with the key distinction that it operates lazily.
     */
    static all<TValue>(
        promises: LazyPromise<TValue>[],
        settings: LazyPromiseSettings<TValue[]> = {},
    ): LazyPromise<TValue[]> {
        const {
            middlewares = [],
            signal = new AbortController().signal,
            name,
        } = settings;
        return new LazyPromise<TValue[]>(
            async () => {
                return Promise.all(promises);
            },
            {
                middlewares,
                signal,
                name,
            },
        );
    }

    /**
     * The `allSettled` method works similarly to {@link Promise.allSettled | `Promise.allSettled`} with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        promises: LazyPromise<TValue>[],
        settings: LazyPromiseSettings<PromiseSettledResult<TValue>[]> = {},
    ): LazyPromise<PromiseSettledResult<TValue>[]> {
        const {
            middlewares = [],
            signal = new AbortController().signal,
            name,
        } = settings;
        return new LazyPromise<PromiseSettledResult<TValue>[]>(
            async () => {
                return Promise.allSettled(promises);
            },
            {
                middlewares,
                signal,
                name,
            },
        );
    }

    /**
     * The `race` method works similarly to {@link Promise.race | `Promise.race`} with the key distinction that it operates lazily.
     */
    static race<TValue>(
        promises: LazyPromise<TValue>[],
        settings: LazyPromiseSettings<TValue> = {},
    ): LazyPromise<TValue> {
        const {
            middlewares = [],
            signal = new AbortController().signal,
            name,
        } = settings;
        return new LazyPromise(
            async () => {
                return Promise.race(promises);
            },
            {
                middlewares,
                signal,
                name,
            },
        );
    }

    /**
     * The `any` method works similarly to {@link Promise.any | `Promise.any`} with the key distinction that it operates lazily.
     */
    static any<TValue>(
        promises: LazyPromise<TValue>[],
        settings: LazyPromiseSettings<TValue> = {},
    ): LazyPromise<TValue> {
        const {
            middlewares = [],
            signal = new AbortController().signal,
            name,
        } = settings;
        return new LazyPromise(
            async () => {
                return Promise.any(promises);
            },
            {
                middlewares,
                signal,
                name,
            },
        );
    }

    /**
     * The `fromCallback` is convience method used for wrapping Node js callback functions with a `LazyPromise`.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { readFile } from "node:fs";
     *
     * const lazyPromise = LazyPromise.fromCallback<Buffer  | string>((resolve, reject, signal) => {
     *   readFile("FILE_PATH", { signal }, (err, data) => {
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
        settings: LazyPromiseSettings<TValue> = {},
    ): LazyPromise<TValue> {
        const {
            middlewares = [],
            signal = new AbortController().signal,
            name,
        } = settings;
        return new LazyPromise(
            (signal) => {
                return new Promise((resolve, reject) => {
                    callback(resolve, reject, signal);
                });
            },
            {
                middlewares,
                signal,
                name,
            },
        );
    }

    private promise: PromiseLike<TValue> | null = null;
    private readonly invokable: AsyncHooks<
        LazyPromiseInvokableParameters<TParameters>,
        TValue
    >;
    private readonly signal: AbortSignal;
    private readonly middlewares: OneOrMore<
        LazyPromiseMiddleware<TValue, TParameters>
    >;
    private readonly name: string | undefined;
    private readonly args: TParameters;

    /**
     * @example
     * ```ts
     * import { LazyPromise, retry } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * const promise = new LazyPromise(async () => {
     *   console.log("I am lazy");
     * }, {
     *   // You can also pass in one AsyncMiddleware or multiple (as an Array).
     *   middlewares: retry()
     * });
     *
     * // "I am lazy" will only logged when awaited or then method i called.
     * await promise;
     * ```
     *
     * The `LazyPromise` handler provides access to an `AbortSignal`, allowing you to react to external abort requests.
     * For example you can use it with `timeout` middleware to abort a `fetch` call when certain time is exceeded.
     * @example
     * ```ts
     * import { LazyPromise, timeout } from "@daiso-tech/core/async";
     *
     * const promise = new LazyPromise(async (signal) => {
     *   const response = await fetch("ENDPOINT", { signal });
     *   const json = await response.json();
     *   if (!response.ok) {
     *     throw json;
     *   }
     *   return json;
     * }, {
     *   middlewares: timeout(TimeSpan.fromSeconds(1))
     * });
     *
     * const result = await promise;
     * console.log(result)
     * ```
     *
     * You can pass both sync or async {@link Invokable | `Invokable`}.
     */
    constructor(
        invokableOrLazyPromise: LazyPromiseHandler<TValue>,
        settings: LazyPromiseSettings<TValue, TParameters> = {},
    ) {
        const {
            middlewares = [],
            signal = new AbortController().signal,
            name,
            args = [],
        } = settings;
        this.name = name;
        this.signal = signal;
        this.middlewares = middlewares;
        this.args = args as TParameters;
        this.invokable = new AsyncHooks(
            (...args) => {
                if (isInvokable(invokableOrLazyPromise)) {
                    return callInvokable(
                        invokableOrLazyPromise,
                        LazyPromise.getSignalArg(args),
                    );
                }
                return invokableOrLazyPromise;
            },
            {
                name,
                middlewares,
                signalBinder: {
                    getSignal: (args) => {
                        return LazyPromise.getSignalArg(args);
                    },
                    forwardSignal: (args, signal) => {
                        LazyPromise.setSignalArg(args, signal);
                    },
                },
            },
        );
    }

    /**
     * The `pipe` method returns a new `LazyPromise` instance with the additional `middlewares` applied.
     */
    pipe(
        middlewares: OneOrMore<LazyPromiseMiddleware<TValue, TParameters>>,
    ): LazyPromise<TValue, TParameters> {
        return new LazyPromise(
            (signal) =>
                this.invokable.pipe(middlewares).invoke(...this.args, signal),
            {
                name: this.name,
                signal: this.signal,
                args: this.args,
                middlewares: this.middlewares,
            },
        );
    }

    /**
     * The `pipeWhen` method conditionally applies additional `middlewares`, returning a new `LazyPromise` instance only if the specified condition is met.
     */
    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<LazyPromiseMiddleware<TValue, TParameters>>,
    ): LazyPromise<TValue, TParameters> {
        return new LazyPromise(
            (signal) =>
                this.invokable
                    .pipeWhen(condition, middlewares)
                    .invoke(...this.args, signal),
            {
                name: this.name,
                signal: this.signal,
                args: this.args,
                middlewares: this.middlewares,
            },
        );
    }

    then<TResult1 = TValue, TResult2 = never>(
        onfulfilled?:
            | ((value: TValue) => TResult1 | PromiseLike<TResult1>)
            | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        if (this.promise === null) {
            this.promise = this.invokable.invoke(...this.args, this.signal);
        }
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
        return this.promise.then(onfulfilled, onrejected);
    }

    /**
     * The `defer` method executes the `LazyPromise` without awaiting it.
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

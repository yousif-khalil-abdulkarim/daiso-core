/**
 * @module Async
 */
import {
    AsyncHooks,
    callInvokable,
    isInvokable,
    type AsyncMiddleware,
    type Invokable,
    type InvokableFn,
    type OneOrMore,
    type Promisable,
    type TimeSpan,
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
export type LazyPromiseInvokable<TValue = unknown> =
    | Invokable<[signal: AbortSignal], Promisable<TValue>>
    | LazyPromise<TValue>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseMiddleware<TValue = unknown> = AsyncMiddleware<
    [signal: AbortSignal],
    TValue
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export type LazyPromiseSettings<TValue = unknown> = {
    middlewares?: OneOrMore<LazyPromiseMiddleware<TValue>>;
    name?: string;
    signal?: AbortSignal;
};

/**
 * The `LazyPromise` class is used for creating lazy {@link PromiseLike | `PromiseLike`} object that will only execute when awaited or when `then` method is called.
 * Note the class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Utilities
 */
export class LazyPromise<TValue = unknown> implements PromiseLike<TValue> {
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
            async (signal) => {
                for (const promise of promises) {
                    promise.mergeSignal(signal);
                }
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
            async (signal) => {
                for (const promise of promises) {
                    promise.mergeSignal(signal);
                }
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
            async (signal) => {
                for (const promise of promises) {
                    promise.mergeSignal(signal);
                }
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
            async (signal) => {
                for (const promise of promises) {
                    promise.mergeSignal(signal);
                }
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
    private readonly invokableOrLazyPromise: AsyncHooks<
        [signal: AbortSignal],
        TValue
    >;
    private signal: AbortSignal;
    private readonly middlewares: OneOrMore<LazyPromiseMiddleware<TValue>>;
    private readonly name: string | undefined;

    /**
     * @example
     * ```ts
     * import { LazyPromise, retryMiddleware } from "@daiso-tech/core/async";
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
        invokableOrLazyPromise: LazyPromiseInvokable<TValue>,
        settings: LazyPromiseSettings<TValue> = {},
    ) {
        const {
            middlewares = [],
            signal = new AbortController().signal,
            name,
        } = settings;
        this.name = name;
        this.signal = signal;
        this.middlewares = middlewares;
        this.invokableOrLazyPromise = new AsyncHooks(
            (signal) => {
                if (isInvokable(invokableOrLazyPromise)) {
                    return callInvokable(invokableOrLazyPromise, signal);
                }
                invokableOrLazyPromise.mergeSignal(signal);
                return invokableOrLazyPromise;
            },
            {
                name,
                middlewares,
                signalBinder: {
                    getSignal: ([signal]) => signal,
                    forwardSignal: (args, signal) => {
                        args[0] = signal;
                    },
                },
            },
        );
    }

    private mergeSignal(signal: AbortSignal): void {
        this.signal = AbortSignal.any([this.signal, signal]);
    }

    /**
     * The `pipe` method returns a new `LazyPromise` instance with the additional `middlewares` applied.
     */
    pipe(
        middlewares: OneOrMore<LazyPromiseMiddleware<TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(this.invokableOrLazyPromise.pipe(middlewares), {
            name: this.name,
            signal: this.signal,
            middlewares: this.middlewares,
        });
    }

    /**
     * The `pipeWhen` method conditionally applies additional `middlewares`, returning a new `LazyPromise` instance only if the specified condition is met.
     */
    pipeWhen(
        condition: boolean,
        middlewares: OneOrMore<LazyPromiseMiddleware<TValue>>,
    ): LazyPromise<TValue> {
        return new LazyPromise(
            this.invokableOrLazyPromise.pipeWhen(condition, middlewares),
            {
                name: this.name,
                signal: this.signal,
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
            this.promise = this.invokableOrLazyPromise.invoke(this.signal);
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

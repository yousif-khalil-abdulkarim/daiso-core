/**
 * @module Async
 */
import type { BackoffPolicy } from "@/async/backof-policies/_module.js";
import type {
    AsyncLazy,
    Invokable,
    InvokableFn,
    ISyncEventListenable,
    Promisable,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import type { RetryPolicy } from "@/async/utilities/retry/_module.js";
import { retryOrFail } from "@/async/utilities/retry/_module.js";
import { timeoutAndFail } from "@/async/utilities/timeout/_module.js";
import { abortAndFail } from "@/async/utilities/abort/_module.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutAsyncError,
} from "@/async/async.errors.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RetryAsyncError,
} from "@/async/async.errors.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
} from "@/async/async.errors.js";
import {
    removeUndefinedProperties,
    resolveAsyncLazyable,
    resolveInvokable,
    SyncEventBus,
} from "@/utilities/_module-exports.js";
import { delay } from "@/async/utilities/_module.js";
import {
    AbortLazyPromiseEvent,
    FailureLazyPromiseEvent,
    FinallyLazyPromiseEvent,
    RetryAttemptLazyPromiseEvent,
    RetryFailureLazyPromiseEvent,
    RetryTimeoutLazyPromiseEvent,
    SuccessLazyPromiseEvent,
    TotalTimeoutFailureLazyPromiseEvent,
    type LazyPromiseEvents,
} from "@/async/utilities/lazy-promise/lazy-promise-events.js";
import type {
    EventClass,
    EventListener,
    EventInstance,
} from "@/event-bus/contracts/event-bus.contract.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseEventMap<TValue = unknown> = {
    failure: {
        error: unknown;
    };
    success: {
        value: TValue;
    };
    finally: undefined;
    retryAttempt: {
        attempt: number;
        error: unknown;
    };
    retryTimeoutFailure: {
        error: TimeoutAsyncError;
    };
    retryFailure: {
        error: RetryAsyncError;
    };
    totalTimeoutFailure: {
        error: TimeoutAsyncError;
    };
    abortFailure: {
        error: AbortAsyncError;
    };
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseSettings = {
    backoffPolicy?: BackoffPolicy | null;
    retryAttempts?: number | null;
    retryPolicy?: RetryPolicy | null;
    retryTimeout?: TimeSpan | null;
    totalTimeout?: TimeSpan | null;
    abortSignal?: AbortSignal | null;
};

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
 * The <i>LazyPromise</i> class is used for creating lazy <i>{@link PromiseLike}<i> object that will only execute when awaited or when then method is called.
 * The class includes helpful methods
 * - <i>defer</i>
 * - <i>setRetryAttempts</i>
 * - <i>setRetryTimeout</i>
 * - <i>setRetryPolicy</i>
 * - <i>setBackoffPolicy</i>
 * - <i>setTotalTimeout</i>
 * - <i>setAbortSignal</i>
 *
 * The order in which these methods are called does not affect their methodality. Internally, the following execution order is applied:
 * 1. <i>setRetryTimeout</i>
 * 2. <i>setRetryAttempts</i>
 * 3. <i>setTotalTimeout</i>
 * 4. <i>setAbortSignal</i>
 *
 * This means that combining all methods ensures the <i>retryAttempts</i> method will continue retrying even if the timeout is triggered,
 * while the <i>abort</i> method takes priority to cancel all operations if activated.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class LazyPromise<TValue>
    implements
        PromiseLike<TValue>,
        ISyncEventListenable<LazyPromiseEvents<TValue>>
{
    /**
     * The <i>wrapFn</i> is convience method used for wrapping async <i>{@link Invokable}</i> with a <i>LazyPromise</i>.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { readFile as readFileNodeJs } from "node:fs/promises";
     *
     * const readFile = LazyPromise.wrapFn(readFileNodeJs);
     *
     * const file = await readFile("none_existing_file.txt")
     *   .setRetryAttempts(4)
     *   .setRetryTimeout(TimeSpan.fromMinutes(1));
     * ```
     */
    static wrapFn<TArgs extends unknown[], TReturn>(
        fn: Invokable<TArgs, Promisable<TReturn>>,
        settings?: LazyPromiseSettings,
    ): InvokableFn<TArgs, LazyPromise<TReturn>> {
        return (...parameters) =>
            new LazyPromise<TReturn>(
                () => resolveInvokable(fn)(...parameters),
                settings,
            );
    }

    /**
     * The <i>delay</i> method creates a <i>{@link LazyPromise}</i> that will be fulfilled after given <i>time</i>.
     *
     * @throws {AsyncError} {@link AsyncError}
     * @throws {AbortAsyncError} {@link AbortAsyncError}
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
    static delay(time: TimeSpan): LazyPromise<void> {
        return new LazyPromise(async () => {
            await delay(time);
        });
    }

    /**
     * The <i>all<i> method works similarly to <i>{@link Promise.all}</i> with the key distinction that it operates lazily.
     */
    static all<TValue>(
        promises: LazyPromise<TValue>[],
        settings?: LazyPromiseSettings,
    ): LazyPromise<TValue[]> {
        return new LazyPromise<TValue[]>(
            async () => Promise.all(promises),
            settings,
        );
    }

    /**
     * The <i>allSettled<i> method works similarly to <i>{@link Promise.allSettled}</i> with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        promises: LazyPromise<TValue>[],
        settings?: LazyPromiseSettings,
    ): LazyPromise<PromiseSettledResult<TValue>[]> {
        return new LazyPromise<PromiseSettledResult<TValue>[]>(
            async () => Promise.allSettled(promises),
            settings,
        );
    }

    /**
     * The <i>race<i> method works similarly to <i>{@link Promise.race}</i> with the key distinction that it operates lazily.
     */
    static race<TValue>(
        promises: LazyPromise<TValue>[],
        settings?: LazyPromiseSettings,
    ): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.race(promises), settings);
    }

    /**
     * The <i>any<i> method works similarly to <i>{@link Promise.any}</i> with the key distinction that it operates lazily.
     */
    static any<TValue>(
        promises: LazyPromise<TValue>[],
        settings?: LazyPromiseSettings,
    ): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.any(promises), settings);
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
        settings?: LazyPromiseSettings,
    ): LazyPromise<TValue> {
        return new LazyPromise(
            () =>
                new Promise((resolve, reject) => {
                    callback(resolve, reject);
                }),
            settings,
        );
    }

    private promise: PromiseLike<TValue> | null = null;
    private asyncFn: () => PromiseLike<TValue>;
    private readonly settings: Required<LazyPromiseSettings>;
    private readonly eventBus = new SyncEventBus<LazyPromiseEvents<TValue>>();

    /**
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     *
     * const promise = new LazyPromise(async () => {
     *   console.log("I am lazy");
     * });
     *
     * // "I am lazy" will only logged when awaited or then method i called.
     * await promise;
     * ```
     *
     * You can pass sync or async <i>{@link Invokable}</i>.
     */
    constructor(
        invokable: AsyncLazy<TValue>,
        settings: LazyPromiseSettings = {},
    ) {
        this.asyncFn = () => resolveAsyncLazyable(invokable);
        this.settings = removeUndefinedProperties({
            retryAttempts: null,
            backoffPolicy: null,
            retryPolicy: null,
            retryTimeout: null,
            totalTimeout: null,
            abortSignal: null,
            onFinally: () => {},
            onSuccess: (_value: TValue) => {},
            onError: () => {},
            ...settings,
        });
    }
    addListener<TEventClass extends EventClass<LazyPromiseEvents<TValue>>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): void {
        this.eventBus.addListener(event, listener);
    }

    removeListener<TEventClass extends EventClass<LazyPromiseEvents<TValue>>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): void {
        this.eventBus.removeListener(event, listener);
    }

    addListener<TEventName extends keyof LazyPromiseEventMap>(
        eventName: Extract<TEventName, string>,
        listener: Invokable<[event: LazyPromiseEventMap[TEventName]]>,
    ): void {
        this.eventBus.addListener(eventName, listener);
    }

    removeListener<TEventName extends keyof LazyPromiseEventMap>(
        eventName: Extract<TEventName, string>,
        listener: Invokable<[event: LazyPromiseEventMap[TEventName]]>,
    ): void {
        this.eventBus.removeListener(eventName, listener);
    }

    private applyRetryTimeout(): void {
        if (this.settings.retryTimeout === null) {
            return;
        }
        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = async () => {
            try {
                if (this.settings.retryTimeout === null) {
                    throw new Error(`LazyPromise["time"] field is null`);
                }
                return await timeoutAndFail(
                    oldAsyncFn,
                    this.settings.retryTimeout,
                );
            } catch (error: unknown) {
                if (error instanceof TimeoutAsyncError) {
                    this.eventBus.dispatch(
                        new RetryTimeoutLazyPromiseEvent({ error }),
                    );
                }
                throw error;
            }
        };
        this.asyncFn = newAsyncFn;
    }

    private applyRetry(): void {
        if (this.settings.retryAttempts === null) {
            return;
        }

        this.applyRetryTimeout();

        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = async () => {
            try {
                if (this.settings.retryAttempts === null) {
                    throw new Error(`LazyPromise["attempts"] field is null`);
                }
                return await retryOrFail(
                    async (attempt) => {
                        try {
                            return await oldAsyncFn();
                        } catch (error: unknown) {
                            this.eventBus.dispatch(
                                new RetryAttemptLazyPromiseEvent({
                                    attempt,
                                    error,
                                }),
                            );
                            throw error;
                        }
                    },
                    {
                        backoffPolicy: this.settings.backoffPolicy ?? undefined,
                        retryPolicy: this.settings.retryPolicy ?? undefined,
                        maxAttempts: this.settings.retryAttempts,
                    },
                );
            } catch (error: unknown) {
                if (error instanceof RetryAsyncError) {
                    this.eventBus.dispatch(
                        new RetryFailureLazyPromiseEvent({ error }),
                    );
                }
                throw error;
            }
        };
        this.asyncFn = newAsyncFn;
    }

    private applyTotalTimeout(): void {
        if (this.settings.totalTimeout === null) {
            return;
        }
        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = () => {
            try {
                if (this.settings.totalTimeout === null) {
                    throw new Error(`LazyPromise["time"] field is null`);
                }
                return timeoutAndFail(oldAsyncFn, this.settings.totalTimeout);
            } catch (error: unknown) {
                if (error instanceof TimeoutAsyncError) {
                    this.eventBus.dispatch(
                        new TotalTimeoutFailureLazyPromiseEvent({ error }),
                    );
                }
                throw error;
            }
        };
        this.asyncFn = newAsyncFn;
    }

    private applyAbort() {
        if (this.settings.abortSignal === null) {
            return;
        }
        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = async () => {
            try {
                if (this.settings.abortSignal === null) {
                    throw new Error(`LazyPromise["abortSignal"] field is null`);
                }
                return await abortAndFail(
                    oldAsyncFn,
                    this.settings.abortSignal,
                );
            } catch (error: unknown) {
                if (error instanceof AbortAsyncError) {
                    this.eventBus.dispatch(
                        new AbortLazyPromiseEvent({ error }),
                    );
                }
                throw error;
            }
        };
        this.asyncFn = newAsyncFn;
    }

    private applySettings(): void {
        this.applyRetry();
        this.applyTotalTimeout();
        this.applyAbort();
    }

    /**
     * The <i>setBackoffPolicy</i> method is used for setting a custom <i>{@link BackoffPolicy}</i>.
     * ```ts
     * import { LazyPromise, linearBackoffPolicy } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .setRetryAttempts(3)
     *   .setBackoffPolicy(linearBackoffPolicy())
     *
     * // Will log "A" 3 times and then retry error will be thrown.
     * await promise;
     * ```
     */
    setBackoffPolicy(policy: BackoffPolicy | null): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    /**
     * The <i>setRetryAttempts</i> method is used for setting max retry attempts.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .setRetryAttempts(3)
     *
     * // Will log "A" 3 times and then retry error will be thrown.
     * await promise;
     * ```
     */
    setRetryAttempts(attempts: number | null): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    /**
     * The <i>setRetryPolicy</i> method is used for setting a custom <i>{@link BackoffPolicy}</i>.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     *
     * class ErrorA extends Error {}
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .setRetryAttempts(3)
     *   // Will only retry an error that is instance ErrorA
     *   .setRetryPolicy(error => error instanceof ErrorA)
     *
     * // Will log "A" 1 time and then error will be thrown.
     * await promise;
     * ```
     */
    setRetryPolicy(policy: RetryPolicy | null): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            retryPolicy: policy,
        });
    }

    /**
     * The <i>setRetryTimeout</i> method aborts the each retry if it exceeds the given <i>time</i>.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     await LazyPromise.delay(TimeSpan.fromMinutes(1));
     *   })
     *   .setRetryTimeout(TimeSpan.fromSeconds(1));
     *
     * // An timeout error will be thrown.
     * await promise;
     * ```
     */
    setRetryTimeout(time: TimeSpan | null): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            retryTimeout: time,
        });
    }

    /**
     * The <i>setTotalTimeout</i> method aborts the <i>LazyPromise</i> if it exceeds the given <i>time</i> by throwning an error.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     await LazyPromise.delay(TimeSpan.fromMinutes(1));
     *   })
     *   .setRetryTimeout(TimeSpan.fromSeconds(1));
     *
     * // An timeout error will be thrown.
     * await promise;
     * ```
     */
    setTotalTimeout(time: TimeSpan | null): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            totalTimeout: time,
        });
    }

    /**
     * The <i>setAbortSignal</i> method aborts the <i>LazyPromise</i> by the passed in <i>abortSignal</i>.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * const abortController = new AbortController();
     * const promise =
     *   new LazyPromise(async () => {
     *     await LazyPromise.delay(TimeSpan.fromMinutes(1));
     *   })
     *   .setAbortSignal(abortController.signal);
     *
     * setTimeout(() => {
     *   abortController.abort();
     * }, 1000);
     *
     * // An timeout error will be thrown.
     * await promise;
     * ```
     */
    setAbortSignal(abortSignal: AbortSignal | null): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            abortSignal,
        });
    }

    /**
     * @throws {AbortAsyncError} {@link AbortAsyncError}
     * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
     * @throws {RetryAsyncError} {@link RetryAsyncError}
     */
    then<TResult1 = TValue, TResult2 = never>(
        onfulfilled?:
            | ((value: TValue) => TResult1 | PromiseLike<TResult1>)
            | null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        this.applySettings();

        if (this.promise === null) {
            this.promise = this.asyncFn();
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
        const onFinally = () => {
            this.eventBus.dispatch(new FinallyLazyPromiseEvent({}));
            this.eventBus.clear();
        };
        const onSuccess = (value: TValue): TValue => {
            this.eventBus.dispatch(new SuccessLazyPromiseEvent({ value }));
            onFinally();
            return value;
        };
        const onFailure = (error: unknown): unknown => {
            this.eventBus.dispatch(new FailureLazyPromiseEvent({ error }));
            onFinally();
            return error;
        };
        this.then(onSuccess, onFailure);
    }
}

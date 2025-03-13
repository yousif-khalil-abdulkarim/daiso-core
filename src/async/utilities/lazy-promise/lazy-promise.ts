/**
 * @module Async
 */

import type { BackoffPolicy } from "@/async/backof-policies/_module.js";
import type {
    AsyncLazy,
    Promisable,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import type { RetryPolicy } from "@/async/utilities/retry/_module.js";
import { retryOrFail } from "@/async/utilities/retry/_module.js";
import { timeoutAndFail } from "@/async/utilities/timeout/_module.js";
import { abortAndFail } from "@/async/utilities/abort/_module.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RetryAsyncError,
} from "@/async/async.errors.js";
import {
    removeUndefinedProperties,
    resolveAsyncLazyable,
} from "@/utilities/_module-exports.js";
import { delay } from "@/async/utilities/_module.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseOnFinally = () => Promisable<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseOnSuccess<TValue> = (value: TValue) => Promisable<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseOnError = (error: unknown) => Promisable<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseCallbacks<TValue = unknown> = {
    onFinally?: LazyPromiseOnFinally;
    onSuccess?: LazyPromiseOnSuccess<TValue>;
    onError?: LazyPromiseOnError;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseSettingsBase = {
    backoffPolicy?: BackoffPolicy | null;
    retryAttempts?: number | null;
    retryPolicy?: RetryPolicy | null;
    retryTimeout?: TimeSpan | null;
    totalTimeout?: TimeSpan | null;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseSettings<TValue = unknown> =
    LazyPromiseCallbacks<TValue> &
        LazyPromiseSettingsBase & {
            abortSignal?: AbortSignal | null;
        };

/**
 * The <i>LazyPromise</i> class is used for creating lazy <i>{@link PromiseLike}<i> object that will only execute when awaited or when then method is called.
 * The class includes helpful methods
 * - <i>defer</i>
 * - <i>retryAttempts</i>
 * - <i>retryPolicy</i>
 * - <i>backoffPolicy</i>
 * - <i>abort</i>
 * - <i>timeout</i>
 *
 * The order in which these methods are called does not affect their methodality. Internally, the following execution order is applied:
 * 1. <i>timeout</i>
 * 2. <i>retryAttempts</i>
 * 3. <i>abort</i>
 *
 * This means that combining all methods ensures the <i>retryAttempts</i> method will continue retrying even if the timeout is triggered,
 * while the <i>abort</i> method takes priority to cancel all operations if activated.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class LazyPromise<TValue> implements PromiseLike<TValue> {
    /**
     * The <i>wrapFn</i> is convience method used for wrapping a async method with a <i>LazyPromise</i>.
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
     *   .timeout(TimeSpan.fromMinutes(1));
     * ```
     */
    static wrapFn<TArgs extends unknown[], TReturn>(
        fn: (...args: TArgs) => PromiseLike<TReturn>,
        settings?: LazyPromiseSettings<TReturn>,
    ) {
        return (...parameters: TArgs): PromiseLike<TReturn> =>
            new LazyPromise<TReturn>(() => fn(...parameters), settings);
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
     */
    static delay(time: TimeSpan): LazyPromise<void> {
        return new LazyPromise(async () => {
            await delay(time);
        });
    }

    /**
     * The <i>all<i> method works similarly to <i>{@link Promise.all}</i> with the key distinction that it operates lazily.
     */
    static all<TValue>(promises: LazyPromise<TValue>[]): LazyPromise<TValue[]> {
        return new LazyPromise<TValue[]>(async () => Promise.all(promises));
    }

    /**
     * The <i>allSettled<i> method works similarly to <i>{@link Promise.allSettled}</i> with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        promises: LazyPromise<TValue>[],
    ): LazyPromise<PromiseSettledResult<TValue>[]> {
        return new LazyPromise<PromiseSettledResult<TValue>[]>(async () =>
            Promise.allSettled(promises),
        );
    }

    /**
     * The <i>race<i> method works similarly to <i>{@link Promise.race}</i> with the key distinction that it operates lazily.
     */
    static race<TValue>(promises: LazyPromise<TValue>[]): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.race(promises));
    }

    /**
     * The <i>any<i> method works similarly to <i>{@link Promise.any}</i> with the key distinction that it operates lazily.
     */
    static any<TValue>(promises: LazyPromise<TValue>[]): LazyPromise<TValue> {
        return new LazyPromise(async () => Promise.any(promises));
    }

    private promise: PromiseLike<TValue> | null = null;
    private asyncFn: () => PromiseLike<TValue>;
    private readonly settings: Required<LazyPromiseSettings<TValue>>;

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
     */
    constructor(
        asyncFn: AsyncLazy<TValue>,
        settings: LazyPromiseSettings<TValue> = {},
    ) {
        this.asyncFn = () => resolveAsyncLazyable(asyncFn);
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

    private applyRetryTimeout(): void {
        if (this.settings.retryTimeout === null) {
            return;
        }
        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = () => {
            if (this.settings.retryTimeout === null) {
                throw new Error(`LazyPromise["time"] field is null`);
            }
            return timeoutAndFail(oldAsyncFn, this.settings.retryTimeout);
        };
        this.asyncFn = newAsyncFn;
    }

    private applyRetry(): void {
        if (this.settings.retryAttempts === null) {
            return;
        }

        this.applyRetryTimeout();

        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = () => {
            if (this.settings.retryAttempts === null) {
                throw new Error(`LazyPromise["attempts"] field is null`);
            }
            return retryOrFail(oldAsyncFn, {
                backoffPolicy: this.settings.backoffPolicy ?? undefined,
                retryPolicy: this.settings.retryPolicy ?? undefined,
                maxAttempts: this.settings.retryAttempts,
            });
        };
        this.asyncFn = newAsyncFn;
    }

    private applyTotalTimeout(): void {
        if (this.settings.totalTimeout === null) {
            return;
        }
        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = () => {
            if (this.settings.totalTimeout === null) {
                throw new Error(`LazyPromise["time"] field is null`);
            }
            return timeoutAndFail(oldAsyncFn, this.settings.totalTimeout);
        };
        this.asyncFn = newAsyncFn;
    }

    private applyAbort() {
        if (this.settings.abortSignal === null) {
            return;
        }
        const oldAsyncFn = this.asyncFn;
        const newAsyncFn = () => {
            if (this.settings.abortSignal === null) {
                throw new Error(`LazyPromise["abortSignal"] field is null`);
            }
            return abortAndFail(oldAsyncFn, this.settings.abortSignal);
        };
        this.asyncFn = newAsyncFn;
    }

    private applySettings(): void {
        this.applyRetry();
        this.applyTotalTimeout();
        this.applyAbort();
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

    onFinally(cb: LazyPromiseOnFinally): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            onFinally: cb,
        });
    }

    onSuccess(cb: LazyPromiseOnSuccess<TValue>): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            onSuccess: cb,
        });
    }

    onError(cb: LazyPromiseOnError): LazyPromise<TValue> {
        return new LazyPromise(this.asyncFn, {
            ...this.settings,
            onError: cb,
        });
    }

    /**
     * The <i>defer</i> method executes the <i>LazyPromise</i> without awaiting it.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core";
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
        const onSuccesHandler = async (value: TValue): Promise<TValue> => {
            try {
                await this.settings.onSuccess(value);
                return value;
            } finally {
                await this.settings.onFinally();
            }
        };

        const onErrorHandler = async (error: unknown): Promise<unknown> => {
            try {
                await this.settings.onError(error);
                return error;
            } finally {
                await this.settings.onFinally();
            }
        };

        this.then(onSuccesHandler, onErrorHandler);
    }
}

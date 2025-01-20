/**
 * @module Async
 */

import type { BackoffPolicy } from "@/async/backof-policies/_module";
import type { TimeSpan } from "@/utilities/time-span/_module";
import type { RetryPolicy } from "@/async/utilities/retry/_module";
import { retryOrFail } from "@/async/utilities/retry/_module";
import { timeoutAndFail } from "@/async/utilities/timeout/_module";
import { abortAndFail } from "@/async/utilities/abort/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RetryAsyncError,
} from "@/async/async.errors";
import type { Func } from "@/utilities/_module";

/**
 * @group Utilities
 */
export type LazyPromiseSettings = {
    retryAttempts?: number | null;
    backoffPolicy?: BackoffPolicy | null;
    retryPolicy?: RetryPolicy | null;
    abortSignal?: AbortSignal | null;
    time?: TimeSpan | null;
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
 * The order in which these methods are called does not affect their functionality. Internally, the following execution order is applied:
 * 1. <i>timeout</i>
 * 2. <i>retryAttempts</i>
 * 3. <i>abort</i>
 *
 * This means that combining all methods ensures the <i>retryAttempts</i> method will continue retrying even if the timeout is triggered,
 * while the <i>abort</i> method takes priority to cancel all operations if activated.
 * @group Utilities
 * @example
 * ```ts
 * import { LazyPromise } from "@daiso-tech/core";
 * import {} from "node:fs/promises";
 *
 * (async () => {
 *   const promise = new LazyPromise(async () => {
 *     console.log("I am lazy");
 *   });
 *   // "I am lazy" will only logged when awaited or then method i called.
 *   await promise;
 * })();
 * ```
 */
export class LazyPromise<TValue> implements PromiseLike<TValue> {
    /**
     * The <i>wrapFn</i> is convience method used for wrapping a async function with a <i>LazyPromise</i>.
     * @example
     * ```ts
     * import { LazyPromise, TimeSpan } from "@daiso-tech/core";
     * import { readFile as readFileNodeJs } from "node:fs/promises";
     *
     * const readFile = LazyPromise.wrapFn(readFileNodeJs, {
     *   retryAttempts: 3
     * });
     *
     * (async () => {
     *   await readFile("none_existing_file.txt").timeout(TimeSpan.fromMinutes(1));
     * })();
     * ```
     */
    static wrapFn<TParameters extends unknown[], TReturn>(
        fn: Func<TParameters, PromiseLike<TReturn>>,
        settings?: LazyPromiseSettings,
    ): Func<TParameters, LazyPromise<TReturn>> {
        return (...parameters) =>
            new LazyPromise(() => fn(...parameters), settings);
    }

    private promise: PromiseLike<TValue> | null = null;
    private attempts: number | null = null;
    private backoffPolicy_: BackoffPolicy | null = null;
    private retryPolicy_: RetryPolicy | null = null;
    private abortSignal: AbortSignal | null = null;
    private time: TimeSpan | null = null;

    constructor(
        private asyncFn: () => PromiseLike<TValue>,
        settings: LazyPromiseSettings = {},
    ) {
        const {
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = null,
            abortSignal = null,
            time = null,
        } = settings;
        this.attempts = retryAttempts;
        this.backoffPolicy_ = backoffPolicy;
        this.retryPolicy_ = retryPolicy;
        this.abortSignal = abortSignal;
        this.time = time;
    }

    private applyTimeout(): void {
        if (this.time !== null) {
            this.asyncFn = () => {
                if (this.time === null) {
                    throw new Error(`LazyPromise["time"] field is null`);
                }
                return timeoutAndFail(this.asyncFn, this.time);
            };
        }
    }

    private applyRetry(): void {
        if (this.attempts !== null && this.attempts > 1) {
            this.asyncFn = () => {
                if (this.attempts === null) {
                    throw new Error(`LazyPromise["attempts"] field is null`);
                }
                return retryOrFail(this.asyncFn, {
                    backoffPolicy: this.backoffPolicy_ ?? undefined,
                    retryPolicy: this.retryPolicy_ ?? undefined,
                    maxAttempts: this.attempts,
                });
            };
        }
    }

    private applyAbort() {
        if (this.abortSignal !== null) {
            this.asyncFn = () => {
                if (this.abortSignal === null) {
                    throw new Error(`LazyPromise["abortSignal"] field is null`);
                }
                return abortAndFail(this.asyncFn, this.abortSignal);
            };
        }
    }

    private applySettings(): void {
        this.applyTimeout();
        this.applyRetry();
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
     * The <i>retryAttempts</i> method is used for setting max retry attempts.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .retryAttempts(3)
     * (async () => {
     *   // Will log "A" 3 times and then retry error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    retryAttempts(attempts: number): this {
        this.attempts = attempts;
        return this;
    }

    /**
     * The <i>backoffPolicy</i> method is used for setting a custom <i>{@link BackoffPolicy}</i>.
     * @example
     * ```ts
     * import { LazyPromise, linearBackoffPolicy } from "@daiso-tech/core";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .retryAttempts(3)
     *   .backoffPolicy(linearBackoffPolicy())
     * (async () => {
     *   // Will log "A" 3 times and then retry error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    backoffPolicy(policy: BackoffPolicy): this {
        this.backoffPolicy_ = policy;
        return this;
    }

    /**
     * The <i>backoffPolicy</i> method is used for setting a custom <i>{@link BackoffPolicy}</i>.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core";
     *
     * class ErrorA extends Error {}
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .retryAttempts(3)
     *   // Will only retry an error that is instance ErrorA
     *   .retryPolicy(error => error instanceof ErrorA)
     * (async () => {
     *   // Will log "A" 1 time and then error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    retryPolicy(policy: RetryPolicy): this {
        this.retryPolicy_ = policy;
        return this;
    }

    /**
     * The <i>timeout</i> method aborts the <i>LazyPromise</i> if it exceeds the given <i>time</i> by throwning an error.
     * @example
     * ```ts
     * import { LazyPromise, delay, TimeSpan } from "@daiso-tech/core";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     await delay(TimeSpan.fromMinutes(1));
     *   })
     *   .timeout(TimeSpan.fromSeconds(1));
     * (async () => {
     *   // An timeout error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    timeout(time: TimeSpan): this {
        this.time = time;
        return this;
    }

    /**
     * The <i>abort</i> method aborts the <i>LazyPromise</i> by the passed in <i>abortSignal</i>.
     * @example
     * ```ts
     * import { LazyPromise, delay, TimeSpan } from "@daiso-tech/core";
     *
     * const abortController = new AbortController();
     * const promise =
     *   new LazyPromise(async () => {
     *     await delay(TimeSpan.fromMinutes(1));
     *   })
     *   .abort(abortController.signal);
     * (async () => {
     *   setTimeout(() => {
     *     abortController.abort();
     *   }, 1000);
     *   // An timeout error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    abort(abortSignal: AbortSignal): this {
        this.abortSignal = abortSignal;
        return this;
    }

    /**
     * The <i>defer</i> method executes the <i>LazyPromise</i> without awaiting it.
     * @example
     * ```ts
     * import { LazyPromise, delay, TimeSpan } from "@daiso-tech/core";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     await delay(TimeSpan.fromSeconds(1));
     *     // Will be loged after one second
     *     console.log("Done !");
     *   });
     * promise.defer();
     * // Will be logged immediately
     * console.log("Hello");
     * ```
     */
    defer(): void {
        this.then();
    }
}

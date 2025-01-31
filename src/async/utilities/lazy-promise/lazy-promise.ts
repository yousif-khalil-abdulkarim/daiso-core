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
 * @group Utilities
 */
export class LazyPromise<TValue> implements PromiseLike<TValue> {
    /**
     * The <i>wrapFn</i> is convience method used for wrapping a async method with a <i>LazyPromise</i>.
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
    ): Func<TParameters, LazyPromise<TReturn>> {
        return (...parameters) => new LazyPromise(() => fn(...parameters));
    }

    /**
     * The <i>all<i> method works similarly to <i>{@link Promise.all}</i> with the key distinction that it operates lazily.
     */
    static all<TValue>(promises: LazyPromise<TValue>[]): LazyPromise<TValue[]> {
        return new LazyPromise(async () => Promise.all(promises));
    }

    /**
     * The <i>allSettled<i> method works similarly to <i>{@link Promise.allSettled}</i> with the key distinction that it operates lazily.
     */
    static allSettled<TValue>(
        promises: LazyPromise<TValue>[],
    ): LazyPromise<PromiseSettledResult<TValue>[]> {
        return new LazyPromise(async () => Promise.allSettled(promises));
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
    private attempts: number | null = null;
    private backoffPolicy_: BackoffPolicy | null = null;
    private retryPolicy_: RetryPolicy | null = null;
    private abortSignal: AbortSignal | null = null;
    private time: TimeSpan | null = null;

    /**
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core";
     *
     * (async () => {
     *   const promise = new LazyPromise(async () => {
     *     console.log("I am lazy");
     *   });
     *   // "I am lazy" will only logged when awaited or then method i called.
     *   await promise;
     * })();
     */
    constructor(private asyncFn: () => PromiseLike<TValue>) {}

    private applyTimeout(): void {
        if (this.time !== null) {
            const oldAsyncFn = this.asyncFn;
            const newAsyncFn = () => {
                if (this.time === null) {
                    throw new Error(`LazyPromise["time"] field is null`);
                }
                return timeoutAndFail(oldAsyncFn, this.time);
            };
            this.asyncFn = newAsyncFn;
        }
    }

    private applyRetry(): void {
        if (this.attempts !== null) {
            const oldAsyncFn = this.asyncFn;
            const newAsyncFn = () => {
                if (this.attempts === null) {
                    throw new Error(`LazyPromise["attempts"] field is null`);
                }
                return retryOrFail(oldAsyncFn, {
                    backoffPolicy: this.backoffPolicy_ ?? undefined,
                    retryPolicy: this.retryPolicy_ ?? undefined,
                    maxAttempts: this.attempts,
                });
            };
            this.asyncFn = newAsyncFn;
        }
    }

    private applyAbort() {
        if (this.abortSignal !== null) {
            const oldAsyncFn = this.asyncFn;
            const newAsyncFn = () => {
                if (this.abortSignal === null) {
                    throw new Error(`LazyPromise["abortSignal"] field is null`);
                }
                return abortAndFail(oldAsyncFn, this.abortSignal);
            };
            this.asyncFn = newAsyncFn;
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
     * The <i>setRetryAttempts</i> method is used for setting max retry attempts.
     * @example
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .setRetryAttempts(3)
     * (async () => {
     *   // Will log "A" 3 times and then retry error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    setRetryAttempts(attempts: number | null): this {
        this.attempts = attempts;
        return this;
    }

    /**
     * The <i>setBackoffPolicy</i> method is used for setting a custom <i>{@link BackoffPolicy}</i>.
     * @example
     * ```ts
     * import { LazyPromise, linearBackoffPolicy } from "@daiso-tech/core";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     console.log("A");
     *     throw new Error("Error occured!");
     *   })
     *   .setRetryAttempts(3)
     *   .setBackoffPolicy(linearBackoffPolicy())
     * (async () => {
     *   // Will log "A" 3 times and then retry error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    setBackoffPolicy(policy: BackoffPolicy | null): this {
        this.backoffPolicy_ = policy;
        return this;
    }

    /**
     * The <i>setRetryPolicy</i> method is used for setting a custom <i>{@link BackoffPolicy}</i>.
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
     *   .setRetryAttempts(3)
     *   // Will only retry an error that is instance ErrorA
     *   .setRetryPolicy(error => error instanceof ErrorA)
     * (async () => {
     *   // Will log "A" 1 time and then error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    setRetryPolicy(policy: RetryPolicy | null): this {
        this.retryPolicy_ = policy;
        return this;
    }

    /**
     * The <i>setTimeout</i> method aborts the <i>LazyPromise</i> if it exceeds the given <i>time</i> by throwning an error.
     * @example
     * ```ts
     * import { LazyPromise, delay, TimeSpan } from "@daiso-tech/core";
     *
     * const promise =
     *   new LazyPromise(async () => {
     *     await delay(TimeSpan.fromMinutes(1));
     *   })
     *   .setTimeout(TimeSpan.fromSeconds(1));
     * (async () => {
     *   // An timeout error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    setTimeout(time: TimeSpan | null): this {
        this.time = time;
        return this;
    }

    /**
     * The <i>setAbortSignal</i> method aborts the <i>LazyPromise</i> by the passed in <i>abortSignal</i>.
     * @example
     * ```ts
     * import { LazyPromise, delay, TimeSpan } from "@daiso-tech/core";
     *
     * const abortController = new AbortController();
     * const promise =
     *   new LazyPromise(async () => {
     *     await delay(TimeSpan.fromMinutes(1));
     *   })
     *   .setAbortSignal(abortController.signal);
     * (async () => {
     *   setTimeout(() => {
     *     abortController.abort();
     *   }, 1000);
     *   // An timeout error will be thrown.
     *   await promise;
     * })();
     * ```
     */
    setAbortSignal(abortSignal: AbortSignal | null): this {
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

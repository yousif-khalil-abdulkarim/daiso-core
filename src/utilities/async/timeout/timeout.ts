/**
 * @module Async
 */

import { LazyPromise } from "@/utilities/async/lazy-promise/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutAsyncError,
} from "@/utilities/async/_shared";
import { abortable } from "@/utilities/async/abortable/_module";
import type { TimeSpan } from "@/utilities/_module";

/**
 * The <i>timeout</i> function makes a <i>{@link PromiseLike}</i> object abort after a given <i>time</i> and you can also abort it on your own by passing <i>abortSignal</i>.
 * @group Promise utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 * @example
 * ```ts
 * import { timeout, delay, TimeSpan } from "@daiso-tech/core";
 *
 * (async () => {
 *   // Will throw an AbortAsyncError
 *   await timeout(async () => {
 *     await delay(TimeSpan.fromSeconds(10));
 *   }, TimeSpan.fromSeconds(5));
 * })();
 * ```
 * @example with abortSignal
 * ```ts
 * import { timeout, delay, TimeSpan } from "@daiso-tech/core";
 *
 * const abortController = new AbortController();
 * setTimeout(() => {
 *   abortController.abort("My abort error");
 * }, TimeSpan.fromSeconds(1));
 *
 * (async () => {
 *   // Will abort after 1 second by throwing AbortAsyncError
 *   await timeout(async () => {
 *     await delay(TimeSpan.fromSeconds(10));
 *   }, TimeSpan.fromSeconds(5), abortController.signal);
 * })();
 * ```
 */
export function timeout<TValue>(
    asyncFn: () => PromiseLike<TValue>,
    time: TimeSpan,
    abortSignal: AbortSignal = new AbortController().signal,
): LazyPromise<TValue> {
    return new LazyPromise(async () => {
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => {
            timeoutController.abort(new TimeoutAsyncError("asdad"));
        }, time.toMilliseconds());
        try {
            return await abortable(
                asyncFn,
                AbortSignal.any([abortSignal, timeoutController.signal]),
            );
        } catch (error: unknown) {
            if (
                error instanceof AbortAsyncError &&
                error.cause instanceof TimeoutAsyncError
            ) {
                throw error.cause;
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    });
}

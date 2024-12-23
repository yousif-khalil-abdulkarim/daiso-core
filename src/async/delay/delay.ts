/**
 * @module Async
 */

import type { TimeSpan } from "@/utilities/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
} from "@/async/_shared";
import { abortable } from "@/async/abortable/_module";
import { LazyPromise } from "@/async/lazy-promise/_module";

/**
 * The <i>delay</i> function creates a promise that will be fulfilled after given <i>time</i> and can be aborted by providing <i>abortSignal</i>.
 * @group Promise utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @example
 * ```ts
 * import { delay, TimeSpan } from "@daiso-tech/core";
 * (async () => {
 *   console.log("a");
 *   await delay(TimeSpan.fromSeconds(2));
 *   console.log("b");
 * })();
 * ```
 * @example with abortSignal
 * ```ts
 * import { delay, TimeSpan } from "@daiso-tech/core";
 *
 * const abortController = new AbortController();
 * setTimeout(() => {
 *  abortController.abort("My abort error");
 * }, TimeSpan.fromSeconds(1).toMilliseconds());
 * const promise = delay(TimeSpan.fromSeconds(2), abortController.signal);
 *
 * (async () => {
 *   console.log("a");
 *   // Will throw AbortAsyncError
 *   await promise;
 *   console.log("b");
 * })();
 * ```
 */
export function delay(
    time: TimeSpan,
    abortSignal: AbortSignal = new AbortController().signal,
): LazyPromise<void> {
    return new LazyPromise(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let timeoutId: any = null;
        const delay = new Promise<void>((resolve) => {
            timeoutId = setTimeout(() => {
                resolve();
            }, time.toMilliseconds());
        });
        try {
            await abortable(() => delay, abortSignal);
        } finally {
            if (timeoutId === null) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                clearTimeout(timeoutId);
            }
        }
    });
}

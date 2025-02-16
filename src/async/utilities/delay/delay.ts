/**
 * @module Async
 */

import { type TimeSpan } from "@/utilities/_module-exports";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
} from "@/async/async.errors";
import { abortAndFail } from "@/async/utilities/abort/_module";

/**
 * The <i>delay</i> function creates a promise that will be fulfilled after given <i>time</i> and can be aborted by providing <i>abortSignal</i>.
 * @group Utilities
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
 */
export async function delay(
    time: TimeSpan,
    abortSignal: AbortSignal = new AbortController().signal,
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeoutId: any = null;
    try {
        // eslint-disable-next-line @typescript-eslint/return-await
        return abortAndFail(
            () =>
                new Promise<void>((resolve) => {
                    timeoutId = setTimeout(() => {
                        resolve();
                    }, time.toMilliseconds());
                }),
            abortSignal,
        );
    } finally {
        if (timeoutId === null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            clearTimeout(timeoutId);
        }
    }
}

/**
 * @module Async
 */

import { type TimeSpan } from "@/utilities/_module-exports.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
} from "@/async/async.errors.js";
import { abortAndFail } from "@/async/utilities/abort/_module.js";

/**
 * @internal
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
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

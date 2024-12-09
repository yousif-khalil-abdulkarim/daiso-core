/**
 * @module Async
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnexpectedAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
} from "@/async/_shared";

export type DelaySettings = {
    abortSignal?: AbortSignal;
};

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {UnexpectedAsyncError} {@link UnexpectedAsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function delay(
    timeInMs: number,
    { abortSignal }: DelaySettings = {},
): Promise<void> {
    if (abortSignal?.aborted) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return Promise.reject(abortSignal.reason);
    }
    return new Promise<void>((resolve, reject) => {
        function abort() {
            clearTimeout(timeoutId);

            if (abortSignal?.aborted) {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(
                    new AbortAsyncError("!!__message__!!", abortSignal.reason),
                );
            }
        }
        function done() {
            abortSignal?.removeEventListener("abort", abort);
            resolve();
        }
        const timeoutId = setTimeout(done, timeInMs);
        abortSignal?.addEventListener("abort", abort, {
            once: true,
        });
    });
}

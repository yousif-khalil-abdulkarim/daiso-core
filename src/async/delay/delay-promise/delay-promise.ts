/**
 * @module Async
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
} from "@/async/_shared";
import { abortablePromise } from "@/async/abortable/_module";
import { lazyPromise } from "@/async/lazy-promise/lazy-promise";

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function delayPromise(
    timeInMs: number,
    abortSignal: AbortSignal = new AbortController().signal,
): PromiseLike<void> {
    return lazyPromise(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let timeoutId: any = null;
        const delayPromise = new Promise<void>((resolve) => {
            timeoutId = setTimeout(() => {
                resolve();
            }, timeInMs);
        });
        try {
            await abortablePromise(() => delayPromise, abortSignal);
        } finally {
            if (timeoutId === null) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                clearTimeout(timeoutId);
            }
        }
    });
}

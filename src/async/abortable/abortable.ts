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

export type AbortableSettings = {
    abortSignal: AbortSignal;
};
/**
 * The <i>abortable</i> function is used for aborting a async function or promise</i>
 * @throws {AsyncError} {@link AsyncError}
 * @throws {UnexpectedAsyncError} {@link UnexpectedAsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @example
 * ```ts
 * import { abortable } from "@daiso-tech/core"
 * import { readFile } from "fs/promises";
 *
 * const abortController = new AbortController();
 * const file = abortable(readFile("path"), {
 *  abortSignal: abortController.signal
 * });
 *
 * abortController.abort()
 *
 * // An AbortAsyncError will be thrown when aborted
 * await file;
 * ```
 */
export function abortable<TValue>(
    promise: Promise<TValue> | (() => Promise<TValue>),
    { abortSignal }: AbortableSettings,
): Promise<TValue> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise<TValue>(function (resolve, reject) {
        function abort(): void {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(abortSignal.reason);
        }
        if (abortSignal.aborted) {
            abort();
            return;
        }
        abortSignal.addEventListener("abort", abort, {
            once: true,
        });

        if (typeof promise === "function") {
            promise = promise();
        }

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        promise.then(resolve);
        promise.catch((error: unknown) => {
            if (!(error instanceof AsyncError)) {
                error = new UnexpectedAsyncError("!!__message__!!", error);
            }
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(error);
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        promise.finally(() => {
            abortSignal.removeEventListener("abort", abort);
        });
    });
}

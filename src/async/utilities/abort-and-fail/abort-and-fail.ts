/**
 * @module Async
 */
import { AbortAsyncError } from "@/async/async.errors.js";

/**
 * @internal
 */
function abortSignalToPromise<TValue = void>(
    abortSignal: AbortSignal,
): {
    promise: Promise<TValue>;
    abort: () => void;
} {
    let reject_: ((value: unknown) => void) | null = null;
    function abort() {
        if (reject_ === null) {
            return;
        }
        reject_(
            new AbortAsyncError(
                `Promise was aborted with reason of "${String(abortSignal.reason)}"`,
                abortSignal.reason,
            ),
        );
    }

    if (abortSignal.aborted) {
        return {
            promise: Promise.reject(
                new AbortAsyncError(
                    `Promise was aborted with reason of "${String(abortSignal.aborted)}"`,
                    abortSignal.reason,
                ),
            ),
            abort,
        };
    }

    return {
        promise: new Promise((_resolve, reject) => {
            reject_ = reject;
            if (abortSignal.aborted) {
                abort();
                return;
            }
            abortSignal.addEventListener("abort", abort, {
                once: true,
            });
        }),
        abort,
    };
}

/**
 * @internal
 */
export async function abortAndFail<TValue>(
    promise: PromiseLike<TValue>,
    abortSignal: AbortSignal,
): Promise<TValue> {
    if (abortSignal.aborted) {
        throw new AbortAsyncError(
            `Promise was aborted with reason of "${String(abortSignal.reason)}"`,
            abortSignal.reason,
        );
    }

    const { promise: abortSignalPromise, abort } =
        abortSignalToPromise<TValue>(abortSignal);
    try {
        return await Promise.race([promise, abortSignalPromise]);
    } finally {
        abortSignal.removeEventListener("abort", abort);
    }
}

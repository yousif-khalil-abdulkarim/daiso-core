/**
 * @module Async
 */
import { AbortAsyncError } from "@/async/async.errors.js";

/**
 * @internal
 */
function abortSignalToPromise<TValue = void>(
    abortSignal: AbortSignal,
    createError: (reason: unknown) => AbortAsyncError,
): {
    promise: Promise<TValue>;
    abort: () => void;
} {
    let reject_: ((value: unknown) => void) | null = null;
    function abort() {
        if (reject_ === null) {
            return;
        }
        reject_(createError(abortSignal.reason));
    }

    if (abortSignal.aborted) {
        return {
            promise: Promise.reject(createError(abortSignal.reason)),
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
    const createError = (reason: unknown) =>
        new AbortAsyncError(
            `Promise was aborted with reason of "${String(reason)}"`,
            reason,
        );
    if (abortSignal.aborted) {
        throw createError(abortSignal.reason);
    }

    const { promise: abortSignalPromise, abort } = abortSignalToPromise<TValue>(
        abortSignal,
        createError,
    );
    try {
        return await Promise.race([promise, abortSignalPromise]);
    } finally {
        abortSignal.removeEventListener("abort", abort);
    }
}

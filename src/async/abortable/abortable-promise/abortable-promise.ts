/**
 * @module Async
 */

import {
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
} from "@/async/_shared";
import { lazyPromise } from "@/async/lazy-promise/lazy-promise";

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
                `Promise was aborted with reason of "${String(abortSignal.aborted)}"`,
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
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function abortablePromise<TValue>(
    promiseFn: () => PromiseLike<TValue>,
    abortSignal: AbortSignal,
): PromiseLike<TValue> {
    return lazyPromise(async () => {
        if (abortSignal.aborted) {
            throw new AbortAsyncError(
                `Promise was aborted with reason of "${String(abortSignal.aborted)}"`,
                abortSignal.reason,
            );
        }

        const { promise: abortSignalPromise, abort } =
            abortSignalToPromise<TValue>(abortSignal);
        try {
            return await Promise.race([promiseFn(), abortSignalPromise]);
        } finally {
            abortSignal.removeEventListener("abort", abort);
        }
    });
}

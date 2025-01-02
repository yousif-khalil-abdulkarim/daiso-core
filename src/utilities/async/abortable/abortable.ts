/**
 * @module Utilities
 */

import {
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
} from "@/utilities/async/_shared";
import { LazyPromise } from "@/utilities/async/lazy-promise/_module";

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
 * The <i>abortable</i> function makes a <i>{@link PromiseLike}</i> object abortable.
 * @group Async utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @example
 * ```ts
 * import { abortable } from "@daiso-tech/core"
 *
 * let a = 0;
 * const abortController = new AbortController();
 * const fn = async () => {
 *  a = 1;
 *  abortController.abort("My message")
 *  await new Promise<void>(resolve => {
 *    setTimeout(() => {
 *      resolve()
 *    }, 0)
 *  })
 *  a = 2;
 * }
 * const promise = abortable(fn, abortController.signal);
 * (async () => {
 *  try {
 *    // An error will be thrown
 *    await promise;
 *  }
 *  finally {
 *    // Will be 1
 *    console.log(a);
 *  }
 * })();
 * ```
 */
export function abortable<TValue>(
    asyncFn: () => PromiseLike<TValue>,
    abortSignal: AbortSignal,
): LazyPromise<TValue> {
    return new LazyPromise(async () => {
        if (abortSignal.aborted) {
            throw new AbortAsyncError(
                `Promise was aborted with reason of "${String(abortSignal.reason)}"`,
                abortSignal.reason,
            );
        }

        const { promise: abortSignalPromise, abort } =
            abortSignalToPromise<TValue>(abortSignal);
        try {
            return await Promise.race([asyncFn(), abortSignalPromise]);
        } finally {
            abortSignal.removeEventListener("abort", abort);
        }
    });
}

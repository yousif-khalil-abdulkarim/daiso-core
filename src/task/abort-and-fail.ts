/**
 * @module Task
 */

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
        reject_(abortSignal.reason);
    }

    if (abortSignal.aborted) {
        return {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            promise: Promise.reject<TValue>(abortSignal.reason),
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
        throw abortSignal.reason;
    }

    const { promise: abortSignalPromise, abort } =
        abortSignalToPromise<TValue>(abortSignal);
    try {
        return await Promise.race([promise, abortSignalPromise]);
    } finally {
        abortSignal.removeEventListener("abort", abort);
    }
}

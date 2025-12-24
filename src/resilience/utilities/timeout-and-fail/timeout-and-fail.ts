/**
 * @module Resilience
 */
import { TimeoutResilienceError } from "@/resilience/resilience.errors.js";
import { abortAndFail } from "@/resilience/utilities/abort-and-fail/_module.js";
import {
    TO_MILLISECONDS,
    type ITimeSpan,
} from "@/time-span/contracts/_module.js";

/**
 * @throws {TimeoutResilienceError} {@link TimeoutResilienceError}
 *
 * @internal
 */
export async function timeoutAndFail<TValue>(
    promise: PromiseLike<TValue>,
    time: ITimeSpan,
    abort: (rejection: unknown) => void,
    signal: AbortSignal,
): Promise<TValue> {
    const timeoutId = setTimeout(() => {
        abort(new TimeoutResilienceError("The promise exceded time"));
    }, time[TO_MILLISECONDS]());
    try {
        return await abortAndFail(promise, signal);
    } finally {
        clearTimeout(timeoutId);
    }
}

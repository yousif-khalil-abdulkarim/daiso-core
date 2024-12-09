/**
 * @module Async
 */

import { abortable } from "@/async/abortable/abortable";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnexpectedAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AbortAsyncError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutAsyncError,
} from "@/async/_shared";

export type TimeoutSettings = {
    timeInMs: number;
    abortSignal?: AbortSignal;
};

/**
 * @throws {AsyncError} {@link AsyncError}
 * @throws {UnexpectedAsyncError} {@link UnexpectedAsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 * @throws {TimeoutAsyncError} {@link TimeoutAsyncError}
 */
export function timeout<TValue>(
    promise: Promise<TValue> | (() => Promise<TValue>),
    { timeInMs, abortSignal }: TimeoutSettings,
): Promise<TValue> {
    const signals = [AbortSignal.timeout(timeInMs)];
    if (abortSignal) {
        signals.push(abortSignal);
    }
    if (typeof promise === "function") {
        promise = promise();
    }
    return abortable(promise, {
        abortSignal: AbortSignal.any(signals),
    }).catch((error: unknown) => {
        if (error instanceof AbortAsyncError) {
            return Promise.reject(
                new AbortAsyncError("!!__message__!!", error),
            );
        }
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return Promise.reject(error);
    });
}

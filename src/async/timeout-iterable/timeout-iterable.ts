/**
 * @module Async
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AsyncError, AbortAsyncError } from "@/async/_shared";
import { abortableIterable } from "@/async/abortable-iterable/_module";
import type { TimeSpan } from "@/utilities/_module";

/**
 * The <i>timeoutIterable</i> function makes a <i>{@link AsyncIterable}</i> abort after a given <i>time</i> and you can also abort it on your own by passing <i>abortSignal</i>.
 * @group AsyncIterable utilities
 * @throws {AsyncError} {@link AsyncError}
 * @throws {AbortAsyncError} {@link AbortAsyncError}
 */
export function timeoutIterable<TValue>(
    iterable: AsyncIterable<TValue>,
    time: TimeSpan,
    abortSignal: AbortSignal = new AbortController().signal,
): AsyncIterable<TValue> {
    return abortableIterable(
        iterable,
        AbortSignal.any([
            abortSignal,
            AbortSignal.timeout(time.toMilliseconds()),
        ]),
    );
}

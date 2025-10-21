/**
 * @module BackoffPolicy
 */

import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import type { Invokable } from "@/utilities/_module-exports.js";

/**
 * @returns Amount milliseconds to wait
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 */
export type BackoffPolicy = Invokable<
    [attempt: number, error: unknown],
    ITimeSpan
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 */
export type DynamicBackoffPolicy<TSettings> =
    | TSettings
    | Invokable<[error: unknown], TSettings | undefined>;

/**
 * @internal
 */
export function withJitter(
    jitter: number,
    value: number,
    mathRandom: () => number,
): number {
    return (1 - jitter * mathRandom()) * value;
}

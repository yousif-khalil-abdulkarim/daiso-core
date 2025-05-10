/**
 * @module Async
 */

import type { Invokable, TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @returns Amount milliseconds to wait
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export type BackoffPolicy = Invokable<
    [attempt: number, error: unknown],
    TimeSpan
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
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

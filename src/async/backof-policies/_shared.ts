/**
 * @module Async
 */

import type { Invokable } from "@/utilities/_module-exports.js";

/**
 * @returns Amount milliseconds to wait
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export type BackoffPolicy = Invokable<
    [attempt: number, error: unknown],
    number
>;
// (attempt: number, error: unknown) => number;

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

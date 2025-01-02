/**
 * @module Utilities
 */

/**
 * @returns Amount milliseconds to wait
 * @group Backoff policies
 */
export type BackoffPolicy = (attempt: number, error: unknown) => number;

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

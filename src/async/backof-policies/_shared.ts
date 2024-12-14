/**
 * @module Async
 */

/**
 * @group Backoff policies
 * @returns Amount milliseconds to wait
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

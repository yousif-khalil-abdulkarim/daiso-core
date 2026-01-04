/**
 * @module Utilities
 */

/**
 * @internal
 */
export type WithJitterArgs = {
    jitter: number | null;
    value: number;
    randomValue: number;
};

/**
 * @internal
 */
export function withJitter(args: WithJitterArgs): number {
    const { jitter, value, randomValue } = args;
    if (jitter !== null) {
        return (1 - jitter * randomValue) * value;
    }
    return value;
}

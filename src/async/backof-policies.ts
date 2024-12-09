/**
 * @module Async
 */

export type BackoffPolicy = (attempt: number, error: unknown) => number;

export type ExponentialBackoffPolicySettings = {
    /**
     * @default {60_000}
     */
    maxDelayInMs?: number;
    /**
     * @default {1_000}
     */
    minDelayInMs?: number;
    /**
     * @default {2}
     */
    multiplier?: number;
    /**
     * @default {1}
     */
    jitter?: number;
};

/**
 * Exponential backoff policy with jitter
 */
export function exponentialBackoffPolicy(
    settings:
        | ExponentialBackoffPolicySettings
        | ((error: unknown) => ExponentialBackoffPolicySettings) = {},
): BackoffPolicy {
    return (attempt, error) => {
        if (typeof settings === "function") {
            settings = settings(error);
        }
        const {
            maxDelayInMs = 60_000,
            minDelayInMs = 1_000,
            multiplier = 2,
            jitter = 1,
        } = settings;
        const exp = Math.min(
            maxDelayInMs,
            minDelayInMs * Math.pow(multiplier, attempt),
        );
        return (1 - jitter * Math.random()) * exp;
    };
}

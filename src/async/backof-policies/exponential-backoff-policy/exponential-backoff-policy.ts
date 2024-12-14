/**
 * @module Async
 */

import { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy } from "@/async/backof-policies/_shared";
import { withJitter } from "@/async/backof-policies/_shared";

/**
 * @group Backoff policies
 */
export type ExponentialBackoffPolicySettings = {
    /**
     * @default 60_000 milliseconds
     */
    maxDelay?: TimeSpan;
    /**
     * @default 1_000 milliseconds
     */
    minDelay?: TimeSpan;
    /**
     * @default {2}
     */
    multiplier?: number;
    /**
     * @default {0.5}
     */
    jitter?: number;
    /**
     * Used only for testing
     * @internal
     */
    _mathRandom?: () => number;
};

/**
 * Exponential backoff policy with jitter
 * @group Backoff policies
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
        let { maxDelay = 60_000, minDelay = 1_000 } = settings;
        if (maxDelay instanceof TimeSpan) {
            maxDelay = maxDelay.toMilliseconds();
        }
        if (minDelay instanceof TimeSpan) {
            minDelay = minDelay.toMilliseconds();
        }
        const {
            multiplier = 2,
            jitter = 0.5,
            _mathRandom = Math.random,
        } = settings;
        const exponential = Math.min(
            maxDelay,
            minDelay * Math.pow(multiplier, attempt),
        );
        return withJitter(jitter, exponential, _mathRandom);
    };
}

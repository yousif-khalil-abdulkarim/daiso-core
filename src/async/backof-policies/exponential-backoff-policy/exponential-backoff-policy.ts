/**
 * @module Async
 */

import type { BackoffPolicy } from "@/async/backof-policies/_shared";
import { withJitter } from "@/async/backof-policies/_shared";

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
    /**
     * Used only for testing
     * @internal
     */
    _mathRandom?: () => number;
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
            _mathRandom = Math.random,
        } = settings;
        const exponential = Math.min(
            maxDelayInMs,
            minDelayInMs * Math.pow(multiplier, attempt),
        );
        return withJitter(jitter, exponential, _mathRandom);
    };
}

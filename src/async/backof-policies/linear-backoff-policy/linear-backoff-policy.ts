/**
 * @module Async
 */

import type { BackoffPolicy } from "@/async/backof-policies/_shared";
import { withJitter } from "@/async/backof-policies/_shared";

export type LinearBackoffPolicySettings = {
    /**
     * @default {6000}
     */
    maxDelayInMs?: number;
    /**
     * @default {1_000}
     */
    minDelayInMs?: number;
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
 * Linear backoff policy with jitter
 */
export function linearBackoffPolicy(
    settings:
        | LinearBackoffPolicySettings
        | ((error: unknown) => LinearBackoffPolicySettings) = {},
): BackoffPolicy {
    return (attempt, error) => {
        if (typeof settings === "function") {
            settings = settings(error);
        }
        const {
            maxDelayInMs = 6000,
            minDelayInMs = 1_000,
            jitter = 0.5,
            _mathRandom = Math.random,
        } = settings;
        const linear = Math.min(maxDelayInMs, minDelayInMs * attempt);
        return withJitter(jitter, linear, _mathRandom);
    };
}

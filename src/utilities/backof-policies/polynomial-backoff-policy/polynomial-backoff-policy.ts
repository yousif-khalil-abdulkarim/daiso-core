/**
 * @module Utilities
 */

import { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy } from "@/utilities/backof-policies/_shared";
import { withJitter } from "@/utilities/backof-policies/_shared";

/**
 * @group Backoff policies
 */
export type PolynomialBackoffPolicySettings = {
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
    degree?: number;
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
 * Polynomial backoff policy with jitter
 * @group Backoff policies
 */
export function polynomialBackoffPolicy(
    settings:
        | PolynomialBackoffPolicySettings
        | ((error: unknown) => PolynomialBackoffPolicySettings) = {},
): BackoffPolicy {
    return (attempt, error) => {
        if (typeof settings === "function") {
            settings = settings(error);
        }
        let { maxDelay = 6000, minDelay = 1_000 } = settings;
        if (maxDelay instanceof TimeSpan) {
            maxDelay = maxDelay.toMilliseconds();
        }
        if (minDelay instanceof TimeSpan) {
            minDelay = minDelay.toMilliseconds();
        }
        const {
            degree = 2,
            jitter = 0.5,
            _mathRandom = Math.random,
        } = settings;
        const polynomial = Math.min(
            maxDelay,
            minDelay * Math.pow(attempt, degree),
        );
        return withJitter(jitter, polynomial, _mathRandom);
    };
}

/**
 * @module Async
 */

import type { BackoffPolicy } from "@/async/backof-policies/_shared";
import { withJitter } from "@/async/backof-policies/_shared";

export type PolynomialBackoffPolicySettings = {
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
 * Polynomial  backoff policy with jitter
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
        const {
            maxDelayInMs = 60_000,
            minDelayInMs = 1_000,
            degree = 2,
            jitter = 0.5,
            _mathRandom = Math.random,
        } = settings;
        const polynomial = Math.min(
            maxDelayInMs,
            minDelayInMs * Math.pow(attempt, degree),
        );
        return withJitter(jitter, polynomial, _mathRandom);
    };
}
Math.min(60_000, 1_000 * Math.pow(1, 2));

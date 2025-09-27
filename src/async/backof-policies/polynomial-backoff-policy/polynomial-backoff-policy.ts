/**
 * @module Async
 */

import {
    callInvokable,
    isInvokable,
    TimeSpan,
    TO_MILLISECONDS,
    type ITimeSpan,
} from "@/utilities/_module-exports.js";
import type {
    BackoffPolicy,
    DynamicBackoffPolicy,
} from "@/async/backof-policies/_shared.js";
import { withJitter } from "@/async/backof-policies/_shared.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export type PolynomialBackoffPolicySettings = {
    /**
     * @default 60_000 milliseconds
     */
    maxDelay?: ITimeSpan;
    /**
     * @default 1_000 milliseconds
     */
    minDelay?: ITimeSpan;
    /**
     * @default 2
     */
    degree?: number;
    /**
     * @default 0.5
     */
    jitter?: number;
    /**
     * @internal
     * Should only be used for testing
     */
    _mathRandom?: () => number;
};

/**
 * Polynomial backoff policy with jitter
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export function polynomialBackoffPolicy(
    settings: DynamicBackoffPolicy<PolynomialBackoffPolicySettings> = {},
): BackoffPolicy {
    return (attempt, error) => {
        if (isInvokable(settings)) {
            const dynamicSettings = callInvokable(settings, error);
            if (dynamicSettings === undefined) {
                settings = {};
            } else {
                settings = dynamicSettings;
            }
        }
        const {
            maxDelay = TimeSpan.fromMilliseconds(6000),
            minDelay = TimeSpan.fromMilliseconds(1_000),
        } = settings;
        const {
            degree = 2,
            jitter = 0.5,
            _mathRandom = Math.random,
        } = settings;
        const polynomial = Math.min(
            maxDelay[TO_MILLISECONDS](),
            minDelay[TO_MILLISECONDS]() * Math.pow(attempt, degree),
        );
        return TimeSpan.fromMilliseconds(
            withJitter(jitter, polynomial, _mathRandom),
        );
    };
}

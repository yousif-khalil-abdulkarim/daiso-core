/**
 * @module Async
 */

import { callInvokable, isInvokable } from "@/utilities/_module-exports.js";
import type {
    BackoffPolicy,
    DynamicBackoffPolicy,
} from "@/backoff-policies/_shared.js";
import { withJitter } from "@/backoff-policies/_shared.js";
import {
    TO_MILLISECONDS,
    type ITimeSpan,
} from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group BackoffPolicies
 */
export type ExponentialBackoffPolicySettings = {
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
    multiplier?: number;
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
 * Exponential backoff policy with jitter
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group BackoffPolicies
 */
export function exponentialBackoffPolicy(
    settings: DynamicBackoffPolicy<ExponentialBackoffPolicySettings> = {},
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
            maxDelay = TimeSpan.fromMilliseconds(60_000),
            minDelay = TimeSpan.fromMilliseconds(1_000),
        } = settings;

        const {
            multiplier = 2,
            jitter = 0.5,
            _mathRandom = Math.random,
        } = settings;
        const exponential = Math.min(
            maxDelay[TO_MILLISECONDS](),
            minDelay[TO_MILLISECONDS]() * Math.pow(multiplier, attempt),
        );
        return TimeSpan.fromMilliseconds(
            withJitter(jitter, exponential, _mathRandom),
        );
    };
}

/**
 * @module Async
 */

import {
    callInvokable,
    isInvokable,
    TimeSpan,
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
export type LinearBackoffPolicySettings = {
    /**
     * @default 6000 milliseconds
     */
    maxDelay?: ITimeSpan;
    /**
     * @default 1_000 milliseconds
     */
    minDelay?: ITimeSpan;
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
 * Linear backoff policy with jitter
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export function linearBackoffPolicy(
    settings: DynamicBackoffPolicy<LinearBackoffPolicySettings> = {},
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
        const { jitter = 0.5, _mathRandom = Math.random } = settings;
        const linear = Math.min(
            maxDelay.toMilliseconds(),
            minDelay.toMilliseconds() * attempt,
        );
        return TimeSpan.fromMilliseconds(
            withJitter(jitter, linear, _mathRandom),
        );
    };
}

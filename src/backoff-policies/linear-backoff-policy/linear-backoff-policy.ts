/**
 * @module BackoffPolicy
 */

import { callInvokable, isInvokable } from "@/utilities/_module-exports.js";
import type {
    BackoffPolicy,
    DynamicBackoffPolicy,
} from "@/backoff-policies/_shared.js";
import { withJitter } from "@/backoff-policies/_shared.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import {
    TO_MILLISECONDS,
    type ITimeSpan,
} from "@/time-span/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
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
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
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
            maxDelay[TO_MILLISECONDS](),
            minDelay[TO_MILLISECONDS]() * attempt,
        );
        return TimeSpan.fromMilliseconds(
            withJitter(jitter, linear, _mathRandom),
        );
    };
}

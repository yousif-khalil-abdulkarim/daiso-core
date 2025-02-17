/**
 * @module Async
 */

import { TimeSpan } from "@/utilities/_module-exports.js";
import type { BackoffPolicy } from "@/async/backof-policies/_shared.js";
import { withJitter } from "@/async/backof-policies/_shared.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Backoff policies
 */
export type LinearBackoffPolicySettings = {
    /**
     * @default 6000 milliseconds
     */
    maxDelay?: TimeSpan;
    /**
     * @default 1_000 milliseconds
     */
    minDelay?: TimeSpan;
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Backoff policies
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
        let { maxDelay = 6000, minDelay = 1_000 } = settings;
        if (maxDelay instanceof TimeSpan) {
            maxDelay = maxDelay.toMilliseconds();
        }
        if (minDelay instanceof TimeSpan) {
            minDelay = minDelay.toMilliseconds();
        }
        const { jitter = 0.5, _mathRandom = Math.random } = settings;
        const linear = Math.min(maxDelay, minDelay * attempt);
        return withJitter(jitter, linear, _mathRandom);
    };
}

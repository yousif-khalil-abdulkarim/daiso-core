/**
 * @module Async
 */

import { TimeSpan } from "@/utilities/_module-exports.js";
import {
    withJitter,
    type BackoffPolicy,
} from "@/async/backof-policies/_shared.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group BackoffPolicies
 */
export type ConstantBackoffPolicySettings = {
    /**
     * @default 1000 milliseconds
     */
    delay?: TimeSpan;
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
 * Constant backoff policy with jitter
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group BackoffPolicies
 */
export function constantBackoffPolicy(
    settings:
        | ConstantBackoffPolicySettings
        | ((error: unknown) => ConstantBackoffPolicySettings) = {},
): BackoffPolicy {
    return (_attempt, error) => {
        if (typeof settings === "function") {
            settings = settings(error);
        }
        let { delay = 1000 } = settings;
        if (delay instanceof TimeSpan) {
            delay = delay.toMilliseconds();
        }
        const { jitter = 0.5, _mathRandom = Math.random } = settings;
        return withJitter(jitter, delay, _mathRandom);
    };
}

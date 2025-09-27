/**
 * @module Async
 */

import type { ITimeSpan } from "@/utilities/_module-exports.js";
import {
    callInvokable,
    isInvokable,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import {
    withJitter,
    type BackoffPolicy,
    type DynamicBackoffPolicy,
} from "@/async/backof-policies/_shared.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export type ConstantBackoffPolicySettings = {
    /**
     * @default 1000 milliseconds
     */
    delay?: ITimeSpan;
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
 * Constant backoff policy with jitter
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export function constantBackoffPolicy(
    settings: DynamicBackoffPolicy<ConstantBackoffPolicySettings> = {},
): BackoffPolicy {
    return (_attempt, error) => {
        if (isInvokable(settings)) {
            const dynamicSettings = callInvokable(settings, error);
            if (dynamicSettings === undefined) {
                settings = {};
            } else {
                settings = dynamicSettings;
            }
        }
        const { delay = TimeSpan.fromMilliseconds(100) } = settings;

        const { jitter = 0.5, _mathRandom = Math.random } = settings;
        return TimeSpan.fromMilliseconds(
            withJitter(jitter, delay.toMilliseconds(), _mathRandom),
        );
    };
}

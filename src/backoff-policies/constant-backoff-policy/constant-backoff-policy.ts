/**
 * @module Async
 */

import { callInvokable, isInvokable } from "@/utilities/_module-exports.js";
import {
    withJitter,
    type BackoffPolicy,
    type DynamicBackoffPolicy,
} from "@/backoff-policies/_shared.js";
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
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
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
            withJitter(jitter, delay[TO_MILLISECONDS](), _mathRandom),
        );
    };
}

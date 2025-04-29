/**
 * @module Async
 */

import { TimeSpan } from "@/utilities/_module-exports.js";
import { type BackoffPolicy } from "@/async/backof-policies/_shared.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group BackoffPolicies
 */
export type ConstantBackoffPolicySettings = {
    /**
     * @default 1000 milliseconds
     */
    delay?: TimeSpan;
};

/**
 * Constant backoff policy with jitter
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
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
        return TimeSpan.fromMilliseconds(delay);
    };
}

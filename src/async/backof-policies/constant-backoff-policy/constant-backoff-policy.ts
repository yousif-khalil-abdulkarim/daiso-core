/**
 * @module Async
 */

import {
    withJitter,
    type BackoffPolicy,
} from "@/async/backof-policies/_shared";

export type ConstantBackoffPolicySettings = {
    /**
     * @default {10_000}
     */
    delayInMs?: number;
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
        const {
            delayInMs = 10_000,
            jitter = 0.5,
            _mathRandom = Math.random,
        } = settings;
        return Math.min(delayInMs, withJitter(jitter, delayInMs, _mathRandom));
    };
}

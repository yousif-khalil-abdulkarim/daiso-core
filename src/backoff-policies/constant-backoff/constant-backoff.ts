/**
 * @module BackoffPolicy
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
 */
export type ConstantBackoffSettings = {
    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(1)
     * ```
     */
    delay?: ITimeSpan;

    /**
     * @default 0.5
     */
    jitter?: number;

    /**
     * @default true
     */
    enableJitter?: boolean;

    /**
     * @internal
     * Should only be used for testing
     */
    _mathRandom?: () => number;
};

/**
 * @internal
 */
export function resolveConstantBackoffSettings(
    settings: ConstantBackoffSettings,
): Required<ConstantBackoffSettings> {
    const {
        enableJitter = true,
        delay = TimeSpan.fromMilliseconds(100),
        jitter = 0.5,
        _mathRandom = Math.random,
    } = settings;

    return {
        delay,
        jitter,
        enableJitter,
        _mathRandom,
    };
}

/**
 * Constant backoff policy with jitter
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 */
export function constantBackoff(
    settings: DynamicBackoffPolicy<ConstantBackoffSettings> = {},
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
        const { delay, jitter, enableJitter, _mathRandom } =
            resolveConstantBackoffSettings(settings);
        return TimeSpan.fromMilliseconds(
            withJitter({
                enable: enableJitter,
                jitter,
                value: delay[TO_MILLISECONDS](),
                mathRandom: _mathRandom,
            }),
        );
    };
}

/**
 * @internal
 */
export type SerializedConstantBackoffSettings = {
    delay?: number;

    jitter?: number;

    enableJitter?: boolean;

    _mathRandom?: number;
};

/**
 * @internal
 */
export function serializeConstantBackoffSettings(
    settings: ConstantBackoffSettings,
): Required<SerializedConstantBackoffSettings> {
    const { delay, jitter, enableJitter, _mathRandom } =
        resolveConstantBackoffSettings(settings);
    return {
        delay: delay[TO_MILLISECONDS](),
        jitter,
        enableJitter,
        _mathRandom: _mathRandom(),
    };
}

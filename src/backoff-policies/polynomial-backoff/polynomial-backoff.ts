/**
 * @module BackoffPolicy
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
 */
export type PolynomialBackoffSettings = {
    /**
     * @default true
     */
    enableJitter?: boolean;

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(60)
     * ```
     */
    maxDelay?: ITimeSpan;

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(1)
     * ```
     */
    minDelay?: ITimeSpan;

    /**
     * @default 2
     */
    degree?: number;

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
 * @internal
 */
export function resolvePolynomialBackoffSettings(
    settings: PolynomialBackoffSettings,
): Required<PolynomialBackoffSettings> {
    const {
        enableJitter = true,
        maxDelay = TimeSpan.fromMilliseconds(6000),
        minDelay = TimeSpan.fromMilliseconds(1_000),
        degree = 2,
        jitter = 0.5,
        _mathRandom = Math.random,
    } = settings;
    return {
        enableJitter,
        maxDelay,
        minDelay,
        degree,
        jitter,
        _mathRandom,
    };
}

/**
 * Polynomial backoff policy with jitter
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 */
export function polynomialBackoff(
    settings: DynamicBackoffPolicy<PolynomialBackoffSettings> = {},
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
            maxDelay,
            minDelay,
            degree,
            jitter,
            enableJitter,
            _mathRandom,
        } = resolvePolynomialBackoffSettings(settings);
        const polynomial = Math.min(
            maxDelay[TO_MILLISECONDS](),
            minDelay[TO_MILLISECONDS]() * Math.pow(attempt, degree),
        );
        return TimeSpan.fromMilliseconds(
            withJitter({
                enable: enableJitter,
                jitter,
                value: polynomial,
                mathRandom: _mathRandom,
            }),
        );
    };
}

/**
 * @internal
 */
export type SerializedPolynomialBackoffSettings = {
    enableJitter?: boolean;

    maxDelay?: number;

    minDelay?: number;

    degree?: number;

    jitter?: number;

    _mathRandom?: number;
};

/**
 * @internal
 */
export function serializePolynomialBackoffSettings(
    settings: PolynomialBackoffSettings,
): Required<SerializedPolynomialBackoffSettings> {
    const { enableJitter, maxDelay, minDelay, degree, jitter, _mathRandom } =
        resolvePolynomialBackoffSettings(settings);
    return {
        enableJitter,
        maxDelay: maxDelay[TO_MILLISECONDS](),
        minDelay: minDelay[TO_MILLISECONDS](),
        degree,
        jitter,
        _mathRandom: _mathRandom(),
    };
}

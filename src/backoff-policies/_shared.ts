/**
 * @module BackoffPolicy
 */

import type { ITimeSpan } from "@/time-span/contracts/_module.js";
import type { Invokable } from "@/utilities/_module.js";
import {
    BACKOFFS,
    type BackoffSettingsEnum,
    type SerializedBackoffSettingsEnum,
} from "@/backoff-policies/types.js";
import {
    resolveConstantBackoffSettings,
    serializeConstantBackoffSettings,
} from "@/backoff-policies/constant-backoff/_module.js";
import {
    resolveExponentialBackoffSettings,
    serializeExponentialBackoffSettings,
} from "@/backoff-policies/exponential-backoff/_module.js";
import {
    resolveLinearBackoffSettings,
    serializeLinearBackoffSettings,
} from "@/backoff-policies/linear-backoff/_module.js";
import {
    resolvePolynomialBackoffSettings,
    serializePolynomialBackoffSettings,
} from "@/backoff-policies/polynomial-backoff/_module.js";

/**
 * @returns Amount milliseconds to wait
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 */
export type BackoffPolicy = Invokable<
    [attempt: number, error: unknown],
    ITimeSpan
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 */
export type DynamicBackoffPolicy<TSettings> =
    | TSettings
    | Invokable<[error: unknown], TSettings | undefined>;

/**
 * @internal
 */
export type WithJitterArgs = {
    jitter: number | null;
    value: number;
    mathRandom: () => number;
};

/**
 * @internal
 */
export function withJitter(args: WithJitterArgs): number {
    const { jitter, value, mathRandom } = args;
    if (jitter !== null) {
        return (1 - jitter * mathRandom()) * value;
    }
    return value;
}

/**
 * @internal
 */
export function resolveBackoffSettingsEnum(
    settings: BackoffSettingsEnum,
): Required<BackoffSettingsEnum> {
    if (settings.type === BACKOFFS.CONSTANT) {
        return {
            type: BACKOFFS.CONSTANT,
            ...resolveConstantBackoffSettings(settings),
        };
    }
    if (settings.type === BACKOFFS.EXPONENTIAL) {
        return {
            type: BACKOFFS.EXPONENTIAL,
            ...resolveExponentialBackoffSettings(settings),
        };
    }
    if (settings.type === BACKOFFS.LINEAR) {
        return {
            type: BACKOFFS.LINEAR,
            ...resolveLinearBackoffSettings(settings),
        };
    }
    return {
        type: BACKOFFS.POLYNOMIAL,
        ...resolvePolynomialBackoffSettings(settings),
    };
}

/**
 * @internal
 */
export function serializeBackoffSettingsEnum(
    settings: BackoffSettingsEnum,
): Required<SerializedBackoffSettingsEnum> {
    if (settings.type === BACKOFFS.CONSTANT) {
        return {
            type: BACKOFFS.CONSTANT,
            ...serializeConstantBackoffSettings(settings),
        };
    }
    if (settings.type === BACKOFFS.EXPONENTIAL) {
        return {
            type: BACKOFFS.EXPONENTIAL,
            ...serializeExponentialBackoffSettings(settings),
        };
    }
    if (settings.type === BACKOFFS.LINEAR) {
        return {
            type: BACKOFFS.LINEAR,
            ...serializeLinearBackoffSettings(settings),
        };
    }
    return {
        type: BACKOFFS.POLYNOMIAL,
        ...serializePolynomialBackoffSettings(settings),
    };
}

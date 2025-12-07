/**
 * @module BackoffPolicy
 */

import type {
    ConstantBackoffSettings,
    SerializedConstantBackoffSettings,
} from "@/backoff-policies/constant-backoff/_module.js";
import type {
    ExponentialBackoffSettings,
    SerializedExponentialBackoffSettings,
} from "@/backoff-policies/exponential-backoff/_module.js";
import type {
    LinearBackoffSettings,
    SerializedLinearBackoffSettings,
} from "@/backoff-policies/linear-backoff/_module.js";
import type {
    PolynomialBackoffSettings,
    SerializedPolynomialBackoffSettings,
} from "@/backoff-policies/polynomial-backoff/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group Adapters
 */
export const BACKOFFS = {
    CONSTANT: "CONSTANT",
    EXPONENTIAL: "EXPONENTIAL",
    LINEAR: "LINEAR",
    POLYNOMIAL: "POLYNOMIAL",
} as const;

/**
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group Adapters
 */
export type BackoffsLiterals = (typeof BACKOFFS)[keyof typeof BACKOFFS];

/**
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group Adapters
 */
export type ConstantBackoffSettingsEnum = Omit<
    ConstantBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["CONSTANT"];
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group Adapters
 */
export type ExponentialBackoffSettingsEnum = Omit<
    ExponentialBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["EXPONENTIAL"];
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group Adapters
 */
export type LinearBackoffSettingsEnum = Omit<
    LinearBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["LINEAR"];
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group Adapters
 */
export type PolynomialBackoffSettingsEnum = Omit<
    PolynomialBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["POLYNOMIAL"];
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/backoff-policies"`
 * @group Adapters
 */
export type BackoffSettingsEnum =
    | ConstantBackoffSettingsEnum
    | ExponentialBackoffSettingsEnum
    | LinearBackoffSettingsEnum
    | PolynomialBackoffSettingsEnum;

/**
 * @internal
 */
export type SerializedConstantBackoffSettingsEnum = Omit<
    SerializedConstantBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["CONSTANT"];
};

/**
 * @internal
 */
export type SerializedExponentialBackoffSettingsEnum = Omit<
    SerializedExponentialBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["EXPONENTIAL"];
};

/**
 * @internal
 */
export type SerializedLinearBackoffSettingsEnum = Omit<
    SerializedLinearBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["LINEAR"];
};

/**
 * @internal
 */
export type SerializedPolynomialBackoffSettingsEnum = Omit<
    SerializedPolynomialBackoffSettings,
    "_mathRandom"
> & {
    type: (typeof BACKOFFS)["POLYNOMIAL"];
};

/**
 * @internal
 */
export type SerializedBackoffSettingsEnum =
    | SerializedConstantBackoffSettingsEnum
    | SerializedExponentialBackoffSettingsEnum
    | SerializedLinearBackoffSettingsEnum
    | SerializedPolynomialBackoffSettingsEnum;

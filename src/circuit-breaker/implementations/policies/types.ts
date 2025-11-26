/**
 * @module CircuitBreaker
 */

import type { ConsecutiveBreakerSettings } from "@/circuit-breaker/implementations/policies/consecutive-breaker/_module.js";
import type { CountBreakerSettings } from "@/circuit-breaker/implementations/policies/count-breaker/_module.js";
import type {
    SamplingBreakerSettings,
    SerializedSamplingBreakerSettings,
} from "@/circuit-breaker/implementations/policies/sampling-breaker/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/policies"`
 * @group Policies
 */
export const BREAKER_POLICIES = {
    CONSECUTIVE: "CONSECUTIVE",
    COUNT: "COUNT",
    SAMPLING: "SAMPLING",
} as const;

/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/policies"`
 * @group Policies
 */
export type ConsecutiveBreakerSettingsEnum = ConsecutiveBreakerSettings & {
    type: (typeof BREAKER_POLICIES)["CONSECUTIVE"];
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/policies"`
 * @group Policies
 */
export type CountBreakerSettingsEnum = CountBreakerSettings & {
    type: (typeof BREAKER_POLICIES)["COUNT"];
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/policies"`
 * @group Policies
 */
export type SamplingBreakerSettingsEnum = SamplingBreakerSettings & {
    type: (typeof BREAKER_POLICIES)["SAMPLING"];
};

/**
 * @internal
 */
export type SerializedSamplingBreakerSettingsEnum =
    SerializedSamplingBreakerSettings & {
        type: (typeof BREAKER_POLICIES)["SAMPLING"];
    };
/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/policies"`
 * @group Policies
 */
export type CircuitBreakerPolicySettingsEnum =
    | ConsecutiveBreakerSettingsEnum
    | CountBreakerSettingsEnum
    | SamplingBreakerSettingsEnum;

/**
 * @internal
 */
export type SerializedCircuitBreakerPolicySettingsEnum =
    | ConsecutiveBreakerSettingsEnum
    | CountBreakerSettingsEnum
    | SerializedSamplingBreakerSettingsEnum;

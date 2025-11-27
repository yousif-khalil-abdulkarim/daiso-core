/**
 * @module CircuitBreaker
 */

import {
    BREAKER_POLICIES,
    type CircuitBreakerPolicySettingsEnum,
    type SerializedCircuitBreakerPolicySettingsEnum,
} from "@/circuit-breaker/implementations/policies/types.js";
import { resolveCountBreakerSettings } from "@/circuit-breaker/implementations/policies/count-breaker/_module.js";
import { resolveConsecutiveBreakerSettings } from "@/circuit-breaker/implementations/policies/consecutive-breaker/_module.js";
import {
    resolveSamplingBreakerSettings,
    serializeSamplingBreakerSettings,
} from "@/circuit-breaker/implementations/policies/_module-exports.js";

/**
 * @internal
 */
export function resolvePolicySettings(
    settings: CircuitBreakerPolicySettingsEnum,
): Required<CircuitBreakerPolicySettingsEnum> {
    if (settings.type === BREAKER_POLICIES.CONSECUTIVE) {
        return {
            type: BREAKER_POLICIES.CONSECUTIVE,
            ...resolveConsecutiveBreakerSettings(settings),
        };
    }
    if (settings.type === BREAKER_POLICIES.SAMPLING) {
        return {
            type: BREAKER_POLICIES.SAMPLING,
            ...resolveSamplingBreakerSettings(settings),
        };
    }
    return {
        type: BREAKER_POLICIES.COUNT,
        ...resolveCountBreakerSettings(settings),
    };
}

/**
 * @internal
 */
export function serializePolicySettingsEnum(
    settings: CircuitBreakerPolicySettingsEnum,
): Required<SerializedCircuitBreakerPolicySettingsEnum> {
    if (settings.type === BREAKER_POLICIES.CONSECUTIVE) {
        return {
            type: BREAKER_POLICIES.CONSECUTIVE,
            ...resolveConsecutiveBreakerSettings(settings),
        };
    }
    if (settings.type === BREAKER_POLICIES.SAMPLING) {
        return {
            type: BREAKER_POLICIES.SAMPLING,
            ...serializeSamplingBreakerSettings(settings),
        };
    }
    return {
        type: BREAKER_POLICIES.COUNT,
        ...resolveCountBreakerSettings(settings),
    };
}

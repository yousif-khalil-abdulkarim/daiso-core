/**
 * @module CircuitBreaker
 */

import { CIRCUIT_BREAKER_STATE } from "@/circuit-breaker/contracts/_module.js";

/**
 * @internal
 */
export const circuitBreakerStateManagerLua = `
-- @template TMetrics
-- @param circuitBreakerPolicy CircuitBreakerPolicy<TMetrics>
-- @param backoffPolicy BackoffPolicy
local function CircuitBreakerStateManager(circuitBreakerPolicy, backoffPolicy)
    return {
        -- @type DatabaseCircuitBreakerUpdateStateFn<TMetrics>
        updateState = function(currentState, currentDate)
            if currentState.type == "${CIRCUIT_BREAKER_STATE.CLOSED}" then
                return circuitBreakerPolicy.whenClosed(currentState, currentDate)
            end
    
            if currentState.type == "${CIRCUIT_BREAKER_STATE.OPEN}" then
                return circuitBreakerPolicy.whenOpened(currentState, {
                    currentDate = currentDate,
                    backoffPolicy = backoffPolicy,
                })
            end
    
            if currentState.type == "${CIRCUIT_BREAKER_STATE.ISOLATED}" then
                return currentState
            end

            if currentState.type == "${CIRCUIT_BREAKER_STATE.HALF_OPEN}" then
                return circuitBreakerPolicy.whenHalfOpened(currentState, currentDate);
            end
        end,

        -- @type DatabaseCircuitBreakerUpdateStateFn<TMetrics>
        trackFailure = function(currentState, currentDate)
            if currentState.type == "${CIRCUIT_BREAKER_STATE.CLOSED}" then
                return circuitBreakerPolicy.trackFailureWhenClosed(currentState, currentDate)
            end

            if currentState.type == "${CIRCUIT_BREAKER_STATE.HALF_OPEN}" then
                return circuitBreakerPolicy.trackFailureWhenHalfOpened(currentState, currentDate)
            end

            return currentState
        end,

        -- @type DatabaseCircuitBreakerUpdateStateFn<TMetrics>
        trackSuccess = function(currentState, currentDate)
            if currentState.type == "${CIRCUIT_BREAKER_STATE.CLOSED}" then
                return circuitBreakerPolicy.trackSuccessWhenClosed(currentState, currentDate)
            end

            if currentState.type == "${CIRCUIT_BREAKER_STATE.HALF_OPEN}" then
                return circuitBreakerPolicy.trackSuccessWhenHalfOpened(currentState, currentDate)
            end

            return currentState
        end,
    }
end
`;

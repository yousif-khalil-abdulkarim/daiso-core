/**
 * @module CircuitBreaker
 */

import { CIRCUIT_BREAKER_STATE } from "@/circuit-breaker/contracts/_module-exports.js";

/**
 * @internal
 */
export const circuitBreakerStateManagerLua = `
-- @template TMetrics
-- @param CircuitBreakerPolicy<TMetrics>
-- @param BackoffPolicy
local function CircuitBreakerStateManager(circuitBreakerPolicy, backoffPolicy, currentDate)
    return {
        -- @param currentState AllCircuitBreakerState<TMetrics>
        -- @retrun AllCircuitBreakerState<TMetrics>
        updateState = function(currentState)
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

        -- @param currentState AllCircuitBreakerState<TMetrics>
        -- @retrun AllCircuitBreakerState<TMetrics>
        trackFailure = function(currentState)
            if currentState.type == "${CIRCUIT_BREAKER_STATE.CLOSED}" then
                return circuitBreakerPolicy.trackFailureWhenClosed(currentState, currentDate)
            end

            if currentState.type == "${CIRCUIT_BREAKER_STATE.HALF_OPEN}" then
                return circuitBreakerPolicy.trackFailureWhenHalfOpened(currentState, currentDate)
            end

            return currentState
        end,

        -- @param currentState AllCircuitBreakerState<TMetrics>
        -- @retrun AllCircuitBreakerState<TMetrics>
        trackSuccess = function(currentState)
            if currentState.type == "${CIRCUIT_BREAKER_STATE.CLOSED}" then
                return circuitBreakerPolicy.trackSuccessWhenClosed(currentState, currentDate)
            end

            if currentState.type == "${CIRCUIT_BREAKER_STATE.HALF_OPEN}" then
                return circuitBreakerPolicy.trackSuccessWhenHalfOpened(currentState, currentDate)
            end

            return currentState
        end,

        -- @retrun AllCircuitBreakerState<TMetrics>
        isolate = function()
            return {
                type = "${CIRCUIT_BREAKER_STATE.ISOLATED}"
            }
        end,
    }
end
`;

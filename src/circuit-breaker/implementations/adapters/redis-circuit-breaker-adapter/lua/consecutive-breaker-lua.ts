/**
 * @module CircuitBreaker
 */

import {
    CIRCUIT_BREAKER_STATE,
    CLOSED_TRANSITIONS,
    HALF_OPEN_TRANSITIONS,
} from "@/circuit-breaker/contracts/_module-exports.js";

/**
 * @internal
 */
export const consecutiveBreakerLua = `
-- @param settings Required<ConsecutiveBreakerSettings>
-- @return ICircuitBreakerPolicy<ConsecutiveBreakerState>
local function ConsecutiveBreaker(settings)
    return {
        -- @return ConsecutiveBreakerState
        initialMetrics = function()
            return {
                failureCount = 0,
                successCount = 0,
            }
        end,

        -- @param currentMetrics ConsecutiveBreakerState
        -- @param _currentDate number
        -- @return ClosedTransitions
        whenClosed = function(currentMetrics, _currentDate)
            local hasFailed = currentMetrics.failureCount >= settings.failureThreshold
            if hasFailed then
                return "${CLOSED_TRANSITIONS.TO_OPEN}"
            end
            return "${CLOSED_TRANSITIONS.NONE}"
        end,

        -- @param currentMetrics ConsecutiveBreakerState
        -- @param _currentDate number
        -- @return HalfOpenTransitions
        whenHalfOpened = function(currentMetrics, _currentDate)
            local hasFailed = currentMetrics.failureCount > 0
            if hasFailed then
                return "${HALF_OPEN_TRANSITIONS.TO_OPEN}"
            end

            local hasSucceeded = currentMetrics.successCount >= settings.successThreshold
            if hasSucceeded then
                return "${HALF_OPEN_TRANSITIONS.TO_CLOSED}"
            end

            return "${HALF_OPEN_TRANSITIONS.NONE}"
        end,

        -- @param currentState CircuitBreakerTrackState<ConsecutiveBreakerState>
        -- @param _settings CircuitBreakerTrackSettings<ConsecutiveBreakerState>
        -- @return ConsecutiveBreakerState
        trackFailure = function(currentState, _settings)
            return {
                failureCount = currentState.metrics.failureCount + 1,
                successCount = currentState.metrics.successCount,
            }
        end,

        -- @param currentState CircuitBreakerTrackState<ConsecutiveBreakerState>
        -- @param _settings CircuitBreakerTrackSettings<ConsecutiveBreakerState>
        -- @return ConsecutiveBreakerState
        trackSuccess = function(currentState, settings)
            if currentState.type == "${CIRCUIT_BREAKER_STATE.CLOSED}" then
                return settings.initialMetrics
            end
    
            return {
                failureCount = currentState.metrics.failureCount,
                successCount = currentState.metrics.successCount + 1,
            }
        end
    }
end
`;

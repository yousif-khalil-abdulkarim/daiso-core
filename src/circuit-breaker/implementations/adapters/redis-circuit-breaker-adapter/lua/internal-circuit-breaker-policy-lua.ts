/**
 * @module CircuitBreaker
 */

import {
    CIRCUIT_BREAKER_STATE,
    CLOSED_TRANSITIONS,
    HALF_OPEN_TRANSITIONS,
} from "@/circuit-breaker/contracts/_module.js";

/**
 * @internal
 */
export const circuitBreakerPolicyLua = `
-- @template TMetrics
-- @param circuitBreakerPolicy ICircuitBreakerPolicy<TMetrics>
local function InternalCircuitBreakerPolicy(circuitBreakerPolicy)
    return {   
        initialState = function()
            return {
                type = "${CIRCUIT_BREAKER_STATE.CLOSED}",
                metrics = circuitBreakerPolicy.initialMetrics(),
            }
        end,

        -- @param currentState ClosedState<TMetrics>
        -- @param currentDate number
        -- @return ClosedState<TMetrics> | OpenedState
        whenClosed = function(currentState, currentDate)
            local transition = circuitBreakerPolicy.whenClosed(currentState.metrics, currentDate)
            
            if transition == "${CLOSED_TRANSITIONS.NONE}" then
                return currentState
            end

            return {
                type = "${CIRCUIT_BREAKER_STATE.OPEN}",
                attempt = 1,
                startedAt = currentDate
            }
        end,

        -- @param OpenedState
        -- @param BackoffPolicySettings
        -- @return OpenedState | HalfOpenedState<TMetrics>
        whenOpened = function(currentState, settings)
            local waitTime = settings.backoffPolicy(currentState.attempt, nil)
            local endDate = currentState.startedAt + waitTime
            local isWaitTimeOver = endDate <= settings.currentDate

            if isWaitTimeOver then
                return {
                    type = "${CIRCUIT_BREAKER_STATE.HALF_OPEN}",
                    attempt = currentState.attempt,
                    metrics = circuitBreakerPolicy.initialMetrics(),
                }
            end

            return currentState
        end,

        -- @param currentState HalfOpenedState<TMetrics>
        -- @param currentDate number
        -- @return ClosedState<TMetrics> | OpenedState | HalfOpenedState<TMetrics>
        whenHalfOpened = function(currentState, currentDate)
            local transition = circuitBreakerPolicy.whenHalfOpened(currentState.metrics, currentDate)

            if transition == "${HALF_OPEN_TRANSITIONS.NONE}" then
                return currentState
            end

            if transition == "${HALF_OPEN_TRANSITIONS.TO_CLOSED}" then
                return {
                    type = "${CIRCUIT_BREAKER_STATE.CLOSED}",
                    metrics = circuitBreakerPolicy.initialMetrics(),
                }
            end
            
            return {
                type = "${CIRCUIT_BREAKER_STATE.OPEN}",
                attempt = currentState.attempt + 1,
                startedAt = currentDate,
            };
        end,

        -- @param currentState ClosedState<TMetrics>
        -- @param currentDate number
        -- @return ClosedState<TMetrics>
        trackSuccessWhenClosed = function(currentState, currentDate)
            local newMetrics = circuitBreakerPolicy.trackSuccess(currentState, {
                currentDate = currentDate,
                initialMetrics = circuitBreakerPolicy.initialMetrics()
            })
            
            return {
                type = currentState.type,
                metrics = newMetrics
            }
        end,
        
        -- @param currentState ClosedState<TMetrics>
        -- @param currentDate number
        -- @return ClosedState<TMetrics>
        trackFailureWhenClosed = function(currentState, currentDate)
            local newMetrics = circuitBreakerPolicy.trackFailure(currentState, {
                currentDate = currentDate,
                initialMetrics = circuitBreakerPolicy.initialMetrics()
            })
            
            return {
                type = currentState.type,
                metrics = newMetrics
            }
        end,

        -- @param currentState HalfOpenedState<TMetrics>
        -- @param currentDate number
        -- @return HalfOpenedState<TMetrics>
        trackSuccessWhenHalfOpened = function(currentState, currentDate)
            local newMetrics = circuitBreakerPolicy.trackSuccess(currentState, {
                currentDate = currentDate,
                initialMetrics = circuitBreakerPolicy.initialMetrics()
            })
            
            return {
                type = currentState.type,
                attempt = currentState.attempt,
                metrics = newMetrics
            }
        end,

        -- @param currentState HalfOpenedState<TMetrics>
        -- @param currentDate number
        -- @return HalfOpenedState<TMetrics>
        trackFailureWhenHalfOpened = function(currentState, currentDate)
            local newMetrics = circuitBreakerPolicy.trackFailure(currentState, {
                currentDate = currentDate,
                initialMetrics = circuitBreakerPolicy.initialMetrics()
            })
            
            return {
                type = currentState.type,
                attempt = currentState.attempt,
                metrics = newMetrics
            }
        end,
    }
end
`;

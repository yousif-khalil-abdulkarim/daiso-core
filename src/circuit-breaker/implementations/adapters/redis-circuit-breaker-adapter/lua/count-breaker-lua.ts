/**
 * @module CircuitBreaker
 */

import {
    CLOSED_TRANSITIONS,
    HALF_OPEN_TRANSITIONS,
} from "@/circuit-breaker/contracts/_module-exports.js";

/**
 * @internal
 */
export const countBreakerLua = `
-- @param settings Required<CountBreakerSettings>
-- @return ICircuitBreakerPolicy<CountBreakerState>
local function CountBreaker(settings)
    
    -- @param currentMetrics CountBreakerState
    -- @return number
    local function getFailureCount(currentMetrics)
        local count = 0
        
        for _index, isSuccess in ipairs(currentMetrics.samples) do
            if not isSuccess then
                count = count + 1
            end
        end

        return count
    end

    -- @param currentMetrics CountBreakerState
    -- @return number
    local function getSuccessCount(currentMetrics)
        local count = 0
        
        for _index, isSuccess in ipairs(currentMetrics.samples) do
            if isSuccess then
                count = count + 1
            end
        end

        return count
    end

    -- @param currentMetrics CountBreakerState
    -- @return boolean
    local function isMinimumNotMet(currentMetrics)
        return #currentMetrics.samples < settings.minimumNumberOfCalls
    end 

    -- @template TItem
    -- @param list Array<TItem>
    -- @return Array<TItem>
    local function copyList(list)
        local newList = {}
        
        for i = 1, #list do
            newList[i] = list[i]
        end

        return newList
    end

    -- @param success boolean
    -- @param currentState CircuitBreakerTrackState<CountBreakerState>
    -- @return CountBreakerState
    local function track(success, currentState)
        local newSamples = copyList(currentState.metrics.samples)
        table.insert(newSamples, success)

        if #currentState.metrics.samples >= settings.size then
            table.remove(newSamples, 1)
        end

        return {
            samples = newSamples
        }
    end

    return {
        -- @return CountBreakerState
        initialMetrics = function()
            return {
                samples = {}
            }
        end,

        -- @param currentMetrics CountBreakerState
        -- @param _currentDate number
        -- @return ClosedTransitions
        whenClosed = function(currentMetrics, _currentDate)
            if isMinimumNotMet(currentMetrics) then
                return "${CLOSED_TRANSITIONS.NONE}"
            end

            local failureCount = math.ceil(
                settings.failureThreshold * #currentMetrics.samples
            )
            local hasFailed = getFailureCount(currentMetrics) > failureCount

            if hasFailed then
                return "${CLOSED_TRANSITIONS.TO_OPEN}"
            end

            return "${CLOSED_TRANSITIONS.NONE}"
        end,

        -- @param currentMetrics CountBreakerState
        -- @param _currentDate number
        -- @return HalfOpenTransitions
        whenHalfOpened = function(currentMetrics, _currentDate)
            if isMinimumNotMet(currentMetrics) then
                return "${CLOSED_TRANSITIONS.NONE}"
            end

            local successCount = math.ceil(settings.successThreshold * #currentMetrics.samples)
            local hasSucceeded = getSuccessCount(currentMetrics) > successCount
            if hasSucceeded then
                return "${HALF_OPEN_TRANSITIONS.TO_CLOSED}"
            end
            return "${HALF_OPEN_TRANSITIONS.TO_OPEN}"
        end,

        -- @param currentState CircuitBreakerTrackState<CountBreakerState>
        -- @param _settings CircuitBreakerTrackSettings<CountBreakerState>
        -- @return CountBreakerState
        trackFailure = function(currentState, _settings)
            return track(false, currentState)
        end,

        -- @param currentState CircuitBreakerTrackState<CountBreakerState>
        -- @param _settings CircuitBreakerTrackSettings<CountBreakerState>
        -- @return CountBreakerState
        trackSuccess = function(currentState, _settings)
            return track(true, currentState)
        end
    }
end
`;

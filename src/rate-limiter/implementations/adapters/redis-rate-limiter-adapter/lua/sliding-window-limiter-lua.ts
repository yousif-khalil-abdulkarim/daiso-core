/**
 * @module RateLimiter
 */

/**
 * @internal
 */
export const slidingWindowLimiterLua = `
-- @param settings Required<SerializedSlidingWindowLimiterSettings>
-- @return IRateLimiterPolicy<SlidingWindowLimiterState>
local function SlidingWindowLimiter(settings)
    -- @param currentDate number
    -- @return number
    local function currentWindow(currentDate)
        return math.floor(currentDate / settings.window) * settings.window
    end

    -- @param currentDate number
    -- @return number
    local function previousWindow(currentDate)
        return currentWindow(currentDate) - settings.window
    end

    -- @param metrics SlidingWindowLimiterState
    -- @param currentDate number
    -- @return SlidingWindowLimiterState
    local function cleanup(metrics, currentDate)
        local previousWindow_ = previousWindow(currentDate)
        local newMetrics = {}

        for key, value in pairs(metrics) do
            local timeStamp = tonumber(timeStampAsStr)
            if timeStamp >= previousWindow_ then
                newMetrics[key] = value
            end
        end

        return newMetrics
    end

    -- @param currentMetrics SlidingWindowLimiterState
    -- @param currentDate number
    -- @return number
    local function currentAttempt(currentMetrics, currentDate)
        local currentAttempt = currentMetrics[currentWindow(currentDate)]
        if currentAttempt == nil then
            currentAttempt = 0
        end

        return currentAttempt
    end

    -- @param currentMetrics SlidingWindowLimiterState
    -- @param currentDate number
    -- @return number
    local function previousAttempt(currentMetrics, currentDate)
        local previousAttempt = currentMetrics[previousWindow(currentDate)]
        if previousAttempt == nil then
            previousAttempt = 0
        end

        local percentageInCurrentWindow = currentDate % settings.window / settings.window
        return math.floor((1 - percentageInCurrentWindow) * previousAttempt)
    end

    return {
        -- @param currentDate number
        -- @return SlidingWindowLimiterState
        initialMetrics = function(currentDate)
            local metrics = {}
            metrics[currentWindow(currentDate)] = 0
            return metrics
        end,

        -- @param currentMetrics SlidingWindowLimiterState
        -- @param limit number
        -- @param currentDate number
        -- @return boolean
        shouldBlock = function(currentMetrics, limit, currentDate)
            local currentAttempt_ = currentAttempt(currentMetrics, currentDate)
            local previousAttempt_ = previousAttempt(currentMetrics, currentDate)
            return currentAttempts + previousAttempts >= limit
        end,

        -- @param _currentMetrics SlidingWindowLimiterState
        -- @param currentDate number
        -- @return number
        getExpiration = function(_currentMetrics, currentDate)
            return settings.window * 2 + settings.margin + currentDate
        end,

        -- @param currentMetrics SlidingWindowLimiterState
        -- @param currentDate number
        -- @return number
        getAttempts = function(currentMetrics, currentDate)
            local currentAttempt_ = currentAttempt(currentMetrics, currentDate)
            local previousAttempt_ = previousAttempt(currentMetrics, currentDate)
            return currentAttempt_ + previousAttempt_
        end,

        -- @param currentMetrics SlidingWindowLimiterState
        -- @param currentDate number
        -- @return SlidingWindowLimiterState
        updateMetrics = function(currentMetrics, currentDate)
            local currentMetrics_ = cleanup(currentMetrics, currentDate)
            local currentAttempt = currentAttempt(currentMetrics, currentDate)
            local currentKey = currentWindow(currentDate)
            currentMetrics_[currentKey] = currentAttempt + 1
            return currentMetrics_
        end
    }
end
`;

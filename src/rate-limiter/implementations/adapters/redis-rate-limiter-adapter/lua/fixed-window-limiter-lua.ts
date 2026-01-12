/**
 * @module RateLimiter
 */

/**
 * @internal
 */
export const fixedWindowLimiterLua = `
-- @param settings Required<SerializedFixedWindowLimiterSettings>
-- @return IRateLimiterPolicy<FixedWindowLimiterState>
local function FixedWindowLimiter(settings)
    return {
        -- @param currentDate number
        -- @return FixedWindowLimiterState
        initialMetrics = function(currentDate)
            return {
                attempt = 0,
                lastAttemptAt = currentDate
            }
        end,

        -- @param currentMetrics FixedWindowLimiterState
        -- @param limit number
        -- @param currentDate number
        shouldBlock = function(currentMetrics, limit, currentDate)
            local timeSinceLastAttempt = currentDate - currentMetrics.lastAttemptAt
            return timeSinceLastAttempt < settings.window and currentMetrics.attempt > limit
        end,

        -- @param currentMetrics FixedWindowLimiterState
        -- @param _currentDate number
        -- @return number
        getExpiration = function(currentMetrics, _currentDate)
            return settings.window + currentMetrics.lastAttemptAt
        end,

        -- @param currentMetrics FixedWindowLimiterState
        -- @param _currentDate number
        -- @return number
        getAttempts = function(currentMetrics, _currentDate)
            return currentMetrics.attempt
        end,

        -- @param currentMetrics FixedWindowLimiterState
        -- @param currentDate number
        -- @return FixedWindowLimiterState
        updateMetrics = function(currentMetrics, currentDate)
            return {
                attempt = currentMetrics.attempt + 1,
                lastAttemptAt = currentDate
            }
        end
    }
end
`;

/**
 * @module RateLimiter
 */
export const rateLimiterLua = `
-- @template TMetrics
-- @param rateLimiterStorage RateLimiterStorage<AllRateLimiterState<TMetrics>>
-- @param rateLimiterStateManager RateLimiterStateManager<TMetrics>
-- @param currentDate number
-- @return IRateLimiterAdapter
local function RateLimiter(rateLimiterStorage, rateLimiterStateManager, currentDate)
    return {
        -- @param key string
        -- @return IRedisJsonRateLimiterState | null
        getState = function(key)
            local state = rateLimiterStorage.find(key)
            if state == nil or state == cjson.null then
                return nil
            end

            return {
                success = state.success,
                attempt = state.attempt,
                resetTime = state.resetTime
            }
        end,

        -- @param key string
        -- @param limit number
        -- @return IRedisJsonRateLimiterState
        updateState = function(key, limit)
            local track = rateLimiterStateManager.track(currentDate) 
            local updateState = rateLimiterStateManager.updateState(limit, currentDate)
            return rateLimiterStorage.atomicUpdate({
                key = key,
                update = function(prevState)
                    local newState1 = track(prevState)
                    local newState2 = updateState(newState1)
                    return newState2
                end
            })
        end,
    }
end
`;

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
        -- @param limit number
        -- @return IRedisJsonRateLimiterState
        updateState = function(key, limit)
            return rateLimiterStorage.atomicUpdate({
                key = key,
                update = function(state)
                    return rateLimiterStateManager.updateState(
                        limit,
                        currentDate
                    )(rateLimtierStateManager.track(currentDate)(state))
                end
            })
        end,
    }
end
`;

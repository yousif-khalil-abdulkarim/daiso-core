/**
 * @module RateLimiterPolicy
 */

import { RATE_LIMITER_STATE } from "@/rate-limiter/contracts/_module-exports.js";

/**
 * @internal
 */
export const rateLimterStorageLua = `
-- @template TMetrics
-- @param rateLimiterPolicy RateLimiterPolicy<TMetrics>
-- @param backoffPolicy BackoffPolicy
-- @param currentDate number
local function RateLimiterStorage(rateLimiterPolicy, backoffPolicy, currentDate)
    
    -- @param AllRateLimiterState<TMetrics>
    -- @return IRedisJsonRateLimiterState
    local function toAdapterState(state)
        local resetTime = state.startedAt
        if state.type == "${RATE_LIMITER_STATE.ALLOWED}" then
            resetTime = nil
        end
        return {
            success = state.type == "${RATE_LIMITER_STATE.ALLOWED}",
            attempt = state.attempt,
            resetTime = resetTime 
        }
    end
    
    return {
        -- @param args AtomicUpdateArgs<TMetrics>
        -- @return IRedisJsonRateLimiterState
        atomicUpdate = function(args)
            local data = cjson.decode(redis.call(args.key))
            local currentState = nil
            if data ~= nil then
                currentState = data.state
            end
            if currentState == nil then
                currentState = rateLimiterPolicy.initialState(currentDate)
            end

            local newState = args.update(currentState)

            redis.call("set", args.key, newState)
            redis.call(
                "pexpireat",
                args.key,
                rateLimiterPolicy.getExpiration(newState, {
                    backoffPolicy = backoffPolicy,
                    currentDate = currentDate
                })
            )

            return toAdapterState(newState)
        end
    }
end
`;

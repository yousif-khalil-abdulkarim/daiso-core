/**
 * @module RateLimiter
 */

import { RATE_LIMITER_STATE } from "@/rate-limiter/contracts/_module.js";

/**
 * @internal
 */
export const rateLimterStorageLua = `
-- @template TMetrics
-- @param rateLimiterPolicy InternalRateLimiterPolicy<TMetrics>
-- @param backoffPolicy BackoffPolicy
-- @param currentDate number
local function RateLimiterStorage(rateLimiterPolicy, backoffPolicy, currentDate)
    
    -- @param AllRateLimiterState<TMetrics>
    -- @return IRedisJsonRateLimiterState
    local function toAdapterState(state)
        return {
            success = state.type == "${RATE_LIMITER_STATE.ALLOWED}",
            attempt = rateLimiterPolicy.getAttempts(state, currentDate),
            resetTime = rateLimiterPolicy.getExpiration(state, {
                backoffPolicy = backoffPolicy,
                currentDate = currentDate
            }),
        }
    end

    local function toAdapterState2(state)
        return {
            success = state.type == "${RATE_LIMITER_STATE.ALLOWED}",
            attempt = rateLimiterPolicy.getAttempts(state, currentDate),
            resetTime = rateLimiterPolicy.getExpiration(state, {
                backoffPolicy = backoffPolicy,
                currentDate = currentDate
            }),
        }
    end
    
    return {
        -- @param args AtomicUpdateArgs<TMetrics>
        -- @return IRedisJsonRateLimiterState
        atomicUpdate = function(args)
            -- local currentState = cjson.decode(redis.call("get", args.key))
            -- if currentState == nil or currentState == cjson.null then
            --     currentState = rateLimiterPolicy.initialState(currentDate)
            -- end

            local currentState = rateLimiterPolicy.initialState(currentDate)
            if redis.call("exists", args.key) == 1 then
                currentState = cjson.decode(redis.call("get", args.key))
            end

            local newState = args.update(currentState)

            local expiration = rateLimiterPolicy.getExpiration(newState, {
                backoffPolicy = backoffPolicy,
                currentDate = currentDate
            })
            redis.call("set", args.key, cjson.encode(newState), "pxat", expiration)
            
            return toAdapterState(newState)
        end,
        
        -- @param Key
        -- @return IRedisJsonRateLimiterState | null
        find = function(key)
            if redis.call("exists", key) == 0 then
                return nil
            end

            return toAdapterState(cjson.decode(redis.call("get", key)))
        end
    }
end
`;

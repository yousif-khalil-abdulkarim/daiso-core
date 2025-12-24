/**
 * @module RateLimiter
 */

import { RATE_LIMITER_STATE } from "@/rate-limiter/contracts/_module.js";

/**
 * @internal
 */
export const rateLimiterStateManagerLua = `
-- @template TMetrics
-- @param rateLimiterPolicy RateLimiterPolicy<TMetrics>
-- @param backoffPolicy BackoffPolicy
local function RateLimiterStateManager(rateLimiterPolicy, backoffPolicy)
    return {
        -- @param limit number
        -- @param currentDate number
        updateState = function(limit, currentDate)
            -- @param currentState AllRateLimiterState<TMetrics>
            -- @return AllRateLimiterState<TMetrics>
            return function(currentState)
                if currentState.type == "${RATE_LIMITER_STATE.ALLOWED}" then
                    return rateLimiterPolicy.whenAllowed(
                        currentState,
                        limit,
                        currentDate
                    )
                end
                return rateLimiterPolicy.whenBlocked(currentState, {
                    currentDate = currentDate,
                    backoffPolicy = backoffPolicy
                })
            end
        end,

        -- @param currentDate number
        track = function(currentDate)
            -- @param currentState AllRateLimiterState<TMetrics>
            -- @return AllRateLimiterState<TMetrics>
            return function(currentState)
                if currentState.type == "${RATE_LIMITER_STATE.ALLOWED}" then
                    return rateLimiterPolicy.trackWhenAllowed(
                        currentState,
                        currentDate
                    )
                end
                return rateLimiterPolicy.trackWhenBlocked(currentState)
            end
        end
    }
end
`;

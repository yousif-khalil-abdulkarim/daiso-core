/**
 * @module RateLimiter
 */

import { RATE_LIMITER_STATE } from "@/rate-limiter/contracts/_module.js";

/**
 * @internal
 */
export const rateLimiterPolicyLua = `
-- @template TMetrics
-- @param rateLimiterPolicy IRateLimiterPolicy
local function RateLimiterPolicy(rateLimiterPolicy)
    return {
        -- @param currentDate number
        -- @return AllowedState<TMetrics>
        initialState = function(currentDate)
            return {
                type = "${RATE_LIMITER_STATE.ALLOWED}",
                metrics = rateLimiterPolicy.initialMetrics(currentDate)
            }
        end,

        -- @param currentState AllowedState<TMetrics>
        -- @param limit number
        -- @param currentDate number
        -- @return AllRateLimiterState<TMetrics>
        whenAllowed = function(currentState, limit, currentDate)
            if rateLimiterPolicy.shouldBlock(currentState.metrics, limit, currentDate) then
                return {
                    type = "${RATE_LIMITER_STATE.BLOCKED}",
                    attempt = 1,
                    startedAt = currentDate
                }
            end

            return currentState
        end,

        -- @param currentState BlockedState
        -- @param settings BackoffPolicySettings
        -- @return AllRateLimiterState<TMetrics>
        whenBlocked = function(currentState, settings)
            local waitTime = settings.backoffPolicy(currentState.attempt, nil)
            local endDate = currentState.startedAt + waitTime
            local isWaitTimeOver = endDate <= settings.currentDate

            if isWaitTimeOver then
                return {
                    type = "${RATE_LIMITER_STATE.ALLOWED}",
                    metrics = rateLimiterPolicy.initialMetrics(settings.currentDate),
                }
            end

            return currentState
        end,

        -- @param currentState AllowedState<TMetrics>
        -- @param currentDate number
        -- @return AllowedState<TMetrics>
        trackWhenAllowed = function(currentState, currentDate)
            return {
                type = currentState.type,
                metrics = rateLimiterPolicy.updateMetrics(currentState.metrics, currentDate),
            }
        end,

        -- @param currentState BlockedState
        -- @return BlockedState
        trackWhenBlocked = function(currentState)
            return {
                type = currentState.type,
                startedAt = currentState.startedAt,
                attempt = currentState.attempt + 1,
            };
        end,

        -- @param currentState AllRateLimiterState<TMetrics>
        -- @param settings BackoffPolicySettings
        -- @return number
        getExpiration = function(currentState, settings)
            if currentState.type == "${RATE_LIMITER_STATE.ALLOWED}" then
                return rateLimiterPolicy.getExpiration(currentState.metrics, settings.currentDate);
            end

            return settings.backoffPolicy(currentState.attempt, nil) + settings.currentDate
        end,

        -- @param currentState AllRateLimiterState<TMetrics>
        -- @param currentDate number
        -- @return number
        getAttempts = function(currentState, currentDate)
            if currentState.type == "${RATE_LIMITER_STATE.ALLOWED}" then
                return rateLimiterPolicy.getAttempts(currentState.metrics, currentDate);
            end

            return currentState.attempt
        end
    }
end
`;

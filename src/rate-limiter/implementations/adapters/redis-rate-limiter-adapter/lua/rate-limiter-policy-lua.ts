/**
 * @module RateLimiter
 */

import { RATE_LIMITER_STATE } from "@/rate-limiter/contracts/_module-exports.js";

/**
 * @internal
 */
export const rateLimiterPolicyLua = `
-- @template TMetrics
-- @param rateLimiterPolicy IRateLimiterPolicy
local function RateLimiterPolicy(rateLimiterPolicy)
    return {
        -- @param currentState AllowedRateLimiterState<TMetrics>
        -- @param limit number
        -- @param currentDate number
        -- @return AllowedRateLimiterState<TMetrics>
        whenAllowed = function(currentState, limit, currentDate)
            if rateLimiterPolicy.shouldBlock(currentState, limit, currentDate) then
                return {
                    type = "${RATE_LIMITER_STATE.BLOCKED}",
                    attempt = 1,
                    startedAt = currentDate
                }
            end

            return currentState
        end,

        -- @param currentState BlockedRateLimiterState
        -- @param settings BackoffPolicySettings
        -- @return AllRateLimiterState<TMetrics>
        whenBlocked = function(currentState, settings)
            local endDate = settings.backoffPolicy(currentState.attempt, nil) + currentState.startedAt
            local isWaitTimeOver = endDate <= settings.currentDate

            if isWaitTimeOver then
                local currentMetrics = rateLimiterPolicy.initialMetrics(settings.currentDate)
                return {
                    attempt = rateLimiterPolicy.getAttempts(currentMetrics, settings.currentDate),
                    type = "${RATE_LIMITER_STATE.ALLOWED}",
                    metrics = currentMetrics
                }
            end

            return currentState
        end,

        -- @param currentState AllowedRateLimiterState<TMetrics>
        -- @param currentDate number
        -- @return AllowedRateLimiterState<TMetrics>
        trackWhenAllowed = function(currentState, currentDate)
            return {
                type = currentState.type,
                attempt = currentState.attempt,
                metrics = rateLimiterPolicy.updateMetrics(currentState.metrics, currentDate)
            }
        end,

        -- @param currentState BlockedRateLimiterState
        -- @return BlockedRateLimiterState
        trackWhenBlocked = function(currentState)
            return {
                type = currentState.type,
                startedAt = currentState.startedAt,
                attempt = currentState.attempt + 1
            }
        end,

        -- @param AllRateLimiterState<TMetrics>
        -- @param settings BackoffPolicySettings
        -- @return number
        getExpiration = function(currentState, settings)
            if currentState.type == "${RATE_LIMITER_STATE.ALLOWED}" then
                return rateLimiterPolicy.getExpiration(currentState.metrics, settings.currentDate)
            end

            return settings.backoffPolicy(currentState.attempt, nil) + settings.currentDate
        end
    }
end
`;

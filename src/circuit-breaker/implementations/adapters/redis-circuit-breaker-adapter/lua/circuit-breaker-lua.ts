/**
 * @module CircuitBreaker
 */

/**
 * @internal
 */
export const circuitBreakerLua = `
-- @template TMetrics
-- @param circuitBreakerStorage CircuitBreakerStorage<TMetrics>
-- @param circuitBreakerStateManager CircuitBreakerStateManager<TMetrics>
-- @param backoffPolicy BackoffPolicy
-- @return ICircuitBreakerAdapter
local function CircuitBreaker(circuitBreakerStorage, circuitBreakerStateManager, backoffPolicy)
    return {
        -- @param key string
        -- @return CircuitBreakerState
        getState = function(key)
            local state = circuitBreakerStorage.find(key)
            return state.type
        end,

        -- @param key string
        -- @return CircuitBreakerStateTransition
        updateState = function(key)
            return circuitBreakerStorage.atomicUpdate(key, circuitBreakerStateManager.updateState)
        end,

        -- @param key string
        -- @return void
        trackFailure = function(key)
            return circuitBreakerStorage.atomicUpdate(key, circuitBreakerStateManager.trackFailure)
        end,

        -- @param key string
        -- @return void
        trackSuccess = function(key)
            return circuitBreakerStorage.atomicUpdate(key, circuitBreakerStateManager.trackSuccess)
        end,

        -- @param key string
        -- @return void
        reset = function(key)
            return circuitBreakerStorage.remove(key)
        end,

        -- @param key string
        -- @return void
        isolate = function(key)
            return circuitBreakerStorage.update(key, circuitBreakerStateManager.isolate)
        end
    }
end
`;

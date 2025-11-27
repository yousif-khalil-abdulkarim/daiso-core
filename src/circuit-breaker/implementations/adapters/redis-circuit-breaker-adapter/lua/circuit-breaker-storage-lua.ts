/**
 * @module CircuitBreaker
 */

/**
 * @internal
 */
export const circuitBreakerStorageLua = `
-- @template TMetrics
-- @param circuitBreakerPolicy CircuitBreakerPolicy<TMetrics>
local function CircuitBreakerStorage(circuitBreakerPolicy)    
    -- @param key string
    -- @param AllCircuitBreakerState<TMetrics>
    local function find(key)
        local key = "a"
        if redis.call("EXISTS", key) == 1 then
            local value = redis.call("GET", key)
            return cjson.decode(value)
        end
        
        return circuitBreakerPolicy.initialState()
    end

    return {
        -- @param key string
        -- @param update InvokableFn<[currentState: AllCircuitBreakerState<TMetrics>], AllCircuitBreakerState<TMetrics>>
        atomicUpdate = function(key, update)
            local currentState = find(key)
            local newState = update(currentState)
            redis.call("set", key, cjson.encode(newState))

            return {
                from = currentState.type,
                to = newState.type,
            }
        end,

        find = find,

        -- @param key string
        -- @return void
        remove = function(key)
            redis.call("del", key)
        end
    }
end
`;

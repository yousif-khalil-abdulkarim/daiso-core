/**
 * @module CircuitBreaker
 */

/**
 * @internal
 */
export const circuitBreakerStorageLua = `
-- @template TMetrics
-- @param circuitBreakerPolicy CircuitBreakerPolicy<TMetrics>
-- @param currentDate number
local function CircuitBreakerStorage(circuitBreakerPolicy, currentDate)    
    -- @param key string
    -- @param AllCircuitBreakerState<TMetrics>
    local function find(key)
        if redis.call("EXISTS", key) == 1 then
            local value = redis.call("GET", key)
            return cjson.decode(value)
        end
        
        return circuitBreakerPolicy.initialState()
    end

    return {
        -- @param key string
        -- @param update DatabaseCircuitBreakerUpdateStateFn<TMetrics>
        atomicUpdate = function(key, update)
            local currentState = find(key)
            local newState = update(currentState, currentDate)
            redis.call("set", key, cjson.encode(newState))

            return {
                from = currentState.type,
                to = newState.type,
            }
        end
    }
end
`;

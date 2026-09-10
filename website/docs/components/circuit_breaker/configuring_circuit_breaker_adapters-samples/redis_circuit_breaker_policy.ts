import { BREAKER_POLICIES } from "eridu-tech/circuit-breaker/policies";
import { RedisCircuitBreakerAdapter } from "eridu-tech/circuit-breaker/redis-circuit-breaker-adapter";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const redisCircuitBreakerAdapter = new RedisCircuitBreakerAdapter({
    database,
    circuitBreakerPolicy: {
        type: BREAKER_POLICIES.CONSECUTIVE,
        failureThreshold: 5,
        successThreshold: 5,
    },
});

import { BACKOFFS } from "eridu-tech/backoff-policies";
import { RedisRateLimiterAdapter } from "eridu-tech/rate-limiter/redis-rate-limiter-adapter";
import Redis from "ioredis";
import { TimeSpan } from "eridu-tech/time-span";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const redisRateLimiterAdapter = new RedisRateLimiterAdapter({
    database,
    backoffPolicy: {
        type: BACKOFFS.CONSTANT,
        delay: TimeSpan.fromSeconds(1),
        jitter: 0.5,
    },
});

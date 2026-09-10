import { DatabaseRateLimiterAdapter } from "eridu-tech/rate-limiter/database-rate-limiter-adapter";
import { SlidingWindowLimiter } from "eridu-tech/rate-limiter/policies";
import { rateLimiterStorageAdapter } from "./rate_limiter_storage_adapter.js";

const rateLimiterAdapter = new DatabaseRateLimiterAdapter({
    adapter: rateLimiterStorageAdapter,
    rateLimiterPolicy: new SlidingWindowLimiter(),
});

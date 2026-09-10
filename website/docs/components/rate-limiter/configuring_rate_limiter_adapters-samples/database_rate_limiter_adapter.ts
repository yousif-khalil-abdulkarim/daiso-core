import { DatabaseRateLimiterAdapter } from "eridu-tech/rate-limiter/database-rate-limiter-adapter";
import { rateLimiterStorageAdapter } from "./rate_limiter_storage_adapter";

const rateLimiterAdapter = new DatabaseRateLimiterAdapter({
    adapter: rateLimiterStorageAdapter,
});

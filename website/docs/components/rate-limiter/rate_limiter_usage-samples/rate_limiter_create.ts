import { rateLimiterFactory } from "./rate_limiter_factory_initial_config.js";

export const rateLimiter = rateLimiterFactory.create("resource", {
    limit: 10,
});

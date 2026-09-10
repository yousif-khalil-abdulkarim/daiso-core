import { rateLimiterFactory } from "./rate_limiter_factory_initial_config";

export const rateLimiter = rateLimiterFactory.create("resource", {
    limit: 10,
});

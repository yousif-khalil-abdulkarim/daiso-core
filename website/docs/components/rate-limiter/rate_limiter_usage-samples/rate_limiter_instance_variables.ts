import { rateLimiterFactory } from "./rate_limiter_factory_initial_config.js";

const rateLimiter = rateLimiterFactory.create("resource", {
    limit: 10,
});

// Will return the key of the rate-limiter which is "resource"
console.log(rateLimiter.key);

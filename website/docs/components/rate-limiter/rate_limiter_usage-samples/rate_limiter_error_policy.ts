import { rateLimiterFactory } from "./rate_limiter_factory_initial_config.js";

class ErrorA extends Error {}

const rateLimiter = rateLimiterFactory.create("resource", {
    onlyError: true,
    limit: 10,
    // Error policy will only work "onlyError" is set to true
    errorPolicy: ErrorA,
});
await rateLimiter.runOrFail(async () => {
    // The code / function to rate limit, called it here
});

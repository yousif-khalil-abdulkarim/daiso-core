import { rateLimiter } from "./rate_limiter_create";

// The function will only be called when the rate-limiter allows the attempt.
await rateLimiter.runOrFail(async () => {
    // The code / function to rate limit, called it here
});

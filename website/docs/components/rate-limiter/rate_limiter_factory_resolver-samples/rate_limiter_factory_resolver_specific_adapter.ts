import { rateLimiterFactoryResolver } from "./rate_limiter_factory_resolver_initial_config.js";

// Will apply rate-limiter logic using the redis adapter
await rateLimiterFactoryResolver
    .use("redis")
    .create("a", {
        limit: 10,
    })
    .runOrFail(async () => {
        // ... code to apply rate-limiter logic
    });

import { rateLimiterFactoryResolver } from "./rate_limiter_factory_resolver_initial_config.js";

await rateLimiterFactoryResolver
    .use("redis")
    .create("a", {
        limit: 10,
    })
    .runOrFail(async () => {
        // ... code to apply rate-limiter logic
    });

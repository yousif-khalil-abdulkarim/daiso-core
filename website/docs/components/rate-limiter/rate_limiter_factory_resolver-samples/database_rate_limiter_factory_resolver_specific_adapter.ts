import { rateLimiterFactoryResolver } from "./database_rate_limiter_factory_resolver_initial_config.js";

// Will apply rate-limiter logic using the sqlite adapter
await rateLimiterFactoryResolver
    .use("sqlite")
    .create("a", {
        limit: 10,
    })
    .runOrFail(async () => {
        // ... code to apply rate-limiter logic
    });

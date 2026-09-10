import { rateLimiterFactoryResolver } from "./database_rate_limiter_factory_resolver_initial_config";

// Will apply rate-limiter logic the default adapter which is MemoryRateLimiterStorageAdapter
await rateLimiterFactoryResolver
    .use()
    .create("a", {
        limit: 10,
    })
    .runOrFail(async () => {
        // ... code to apply rate-limiter logic
    });

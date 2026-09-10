import { circuitBreakerFactoryResolver } from "./database_circuit_breaker_factory_resolver_initial_config.js";

// Will apply circuit-breaker logic the default adapter which is MemoryCircuitBreakerStorageAdapter
await circuitBreakerFactoryResolver
    .use()
    .create("a")
    .runOrFail(async () => {
        // ... code to apply circuit-breaker logic
    });

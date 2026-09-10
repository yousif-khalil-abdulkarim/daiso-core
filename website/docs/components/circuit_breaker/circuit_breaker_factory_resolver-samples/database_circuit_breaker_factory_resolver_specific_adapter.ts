import { circuitBreakerFactoryResolver } from "./database_circuit_breaker_factory_resolver_initial_config";

// Will apply circuit-breaker logic using the sqlite adapter
await circuitBreakerFactoryResolver
    .use("sqlite")
    .create("a")
    .runOrFail(async () => {
        // ... code to apply circuit-breaker logic
    });

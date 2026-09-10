import { CountBreaker } from "eridu-tech/circuit-breaker/policies";
import { constantBackoff } from "eridu-tech/backoff-policies";
import { circuitBreakerFactoryResolver } from "./database_circuit_breaker_factory_resolver_initial_config";

await circuitBreakerFactoryResolver
    .setDefaultBackoffPolicy(constantBackoff())
    .setDefaultCircuitBreakerPolicy(new CountBreaker())
    .use("sqlite")
    .create("a")
    .runOrFail(async () => {
        // ... code to apply circuit-breaker logic
    });

import { circuitBreakerFactoryResolver } from "./circuit_breaker_factory_resolver_initial_config";
import { CIRCUIT_BREAKER_TRIGGER } from "eridu-tech/circuit-breaker/contracts";

await circuitBreakerFactoryResolver
    .setDefaultTrigger(CIRCUIT_BREAKER_TRIGGER.ONLY_ERROR)
    .use("redis")
    .create("a")
    .runOrFail(async () => {
        // ... code to apply circuit-breaker logic
    });

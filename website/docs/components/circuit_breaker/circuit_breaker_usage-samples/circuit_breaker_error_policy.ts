import { circuitBreakerFactory } from "./circuit_breaker_initial_config.js";

class ErrorA extends Error {}

const circuitBreaker = circuitBreakerFactory.create("resource", {
    errorPolicy: ErrorA,
});
await circuitBreaker.runOrFail(async () => {
    // Call the external service
});

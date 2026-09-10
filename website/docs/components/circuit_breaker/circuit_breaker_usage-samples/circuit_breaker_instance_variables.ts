import { circuitBreakerFactory } from "./circuit_breaker_initial_config";

const circuitBreaker = circuitBreakerFactory.create("resource");

// Will return the key of the circuit-breaker which is "resource"
console.log(circuitBreaker);

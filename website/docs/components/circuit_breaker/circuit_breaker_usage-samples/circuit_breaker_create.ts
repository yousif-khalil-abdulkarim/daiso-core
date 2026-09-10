import { circuitBreakerFactory } from "./circuit_breaker_initial_config";

export const circuitBreaker = circuitBreakerFactory.create("resource");

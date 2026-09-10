import { circuitBreakerFactory } from "./circuit_breaker_initial_config.js";

export const circuitBreaker = circuitBreakerFactory.create("resource");

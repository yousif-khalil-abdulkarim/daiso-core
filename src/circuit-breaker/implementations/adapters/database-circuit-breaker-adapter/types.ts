/**
 * @module CircuitBreaker
 */
import { type AllCircuitBreakerState } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/internal-circuit-breaker-policy.js";
import { type InvokableFn } from "@/utilities/_module.js";

/**
 * @internal
 */
export type DatabaseCircuitBreakerUpdateStateFn<TMetrics = unknown> =
    InvokableFn<
        [currentState: AllCircuitBreakerState<TMetrics>, currentDate: Date],
        AllCircuitBreakerState<TMetrics>
    >;

/**
 * @module CircuitBreaker
 */
import { type AllCircuitBreakerState } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type DatabaseCircuitBreakerUpdateStateFn<TMetrics = unknown> =
    InvokableFn<
        [currentState: AllCircuitBreakerState<TMetrics>, currentDate: Date],
        AllCircuitBreakerState<TMetrics>
    >;

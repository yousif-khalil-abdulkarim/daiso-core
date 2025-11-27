/**
 * @module CircuitBreaker
 */

import type { BackoffPolicy } from "@/backoff-policies/_module-exports.js";
import { CIRCUIT_BREAKER_STATE } from "@/circuit-breaker/contracts/_module-exports.js";
import type { CircuitBreakerPolicy } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";
import { type AllCircuitBreakerState } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";

/**
 * @internal
 */
export class CircuitBreakerStateManager<TMetrics = unknown> {
    constructor(
        private readonly circuitBreakerPolicy: CircuitBreakerPolicy<TMetrics>,
        private readonly backoffPolicy: BackoffPolicy,
    ) {}

    updateState = (
        currentState: AllCircuitBreakerState<TMetrics>,
    ): AllCircuitBreakerState<TMetrics> => {
        if (currentState.type === CIRCUIT_BREAKER_STATE.CLOSED) {
            return this.circuitBreakerPolicy.whenClosed(
                currentState,
                new Date(),
            );
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.OPEN) {
            return this.circuitBreakerPolicy.whenOpened(currentState, {
                currentDate: new Date(),
                backoffPolicy: this.backoffPolicy,
            });
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.ISOLATED) {
            return currentState;
        }

        return this.circuitBreakerPolicy.whenHalfOpened(
            currentState,
            new Date(),
        );
    };

    trackFailure = (
        currentState: AllCircuitBreakerState<TMetrics>,
    ): AllCircuitBreakerState<TMetrics> => {
        if (currentState.type === CIRCUIT_BREAKER_STATE.CLOSED) {
            return this.circuitBreakerPolicy.trackFailureWhenClosed(
                currentState,
                new Date(),
            );
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.HALF_OPEN) {
            return this.circuitBreakerPolicy.trackFailureWhenHalfOpened(
                currentState,
                new Date(),
            );
        }

        return currentState;
    };

    trackSuccess = (
        currentState: AllCircuitBreakerState<TMetrics>,
    ): AllCircuitBreakerState<TMetrics> => {
        if (currentState.type === CIRCUIT_BREAKER_STATE.CLOSED) {
            return this.circuitBreakerPolicy.trackSuccessWhenClosed(
                currentState,
                new Date(),
            );
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.HALF_OPEN) {
            return this.circuitBreakerPolicy.trackSuccessWhenHalfOpened(
                currentState,
                new Date(),
            );
        }

        return currentState;
    };

    isolate = (): AllCircuitBreakerState<TMetrics> => {
        return {
            type: CIRCUIT_BREAKER_STATE.ISOLATED,
        };
    };
}

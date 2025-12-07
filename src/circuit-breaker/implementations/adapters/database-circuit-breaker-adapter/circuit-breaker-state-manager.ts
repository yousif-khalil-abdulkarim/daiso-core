/**
 * @module CircuitBreaker
 */

import type { BackoffPolicy } from "@/backoff-policies/_module-exports.js";
import { CIRCUIT_BREAKER_STATE } from "@/circuit-breaker/contracts/_module-exports.js";
import type { CircuitBreakerPolicy } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";
import type { DatabaseCircuitBreakerUpdateStateFn } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/types.js";

/**
 * @internal
 */
export class CircuitBreakerStateManager<TMetrics = unknown> {
    constructor(
        private readonly circuitBreakerPolicy: CircuitBreakerPolicy<TMetrics>,
        private readonly backoffPolicy: BackoffPolicy,
    ) {}

    updateState: DatabaseCircuitBreakerUpdateStateFn<TMetrics> = (
        currentState,
        currentDate,
    ) => {
        if (currentState.type === CIRCUIT_BREAKER_STATE.CLOSED) {
            return this.circuitBreakerPolicy.whenClosed(
                currentState,
                currentDate,
            );
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.OPEN) {
            return this.circuitBreakerPolicy.whenOpened(currentState, {
                currentDate: currentDate,
                backoffPolicy: this.backoffPolicy,
            });
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.ISOLATED) {
            return currentState;
        }

        return this.circuitBreakerPolicy.whenHalfOpened(
            currentState,
            currentDate,
        );
    };

    trackFailure: DatabaseCircuitBreakerUpdateStateFn<TMetrics> = (
        currentState,
        currentDate,
    ) => {
        if (currentState.type === CIRCUIT_BREAKER_STATE.CLOSED) {
            return this.circuitBreakerPolicy.trackFailureWhenClosed(
                currentState,
                currentDate,
            );
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.HALF_OPEN) {
            return this.circuitBreakerPolicy.trackFailureWhenHalfOpened(
                currentState,
                currentDate,
            );
        }

        return currentState;
    };

    trackSuccess: DatabaseCircuitBreakerUpdateStateFn<TMetrics> = (
        currentState,
        currentDate,
    ) => {
        if (currentState.type === CIRCUIT_BREAKER_STATE.CLOSED) {
            return this.circuitBreakerPolicy.trackSuccessWhenClosed(
                currentState,
                currentDate,
            );
        }

        if (currentState.type === CIRCUIT_BREAKER_STATE.HALF_OPEN) {
            return this.circuitBreakerPolicy.trackSuccessWhenHalfOpened(
                currentState,
                currentDate,
            );
        }

        return currentState;
    };

    isolate: DatabaseCircuitBreakerUpdateStateFn<TMetrics> = (
        _currentState,
        _currentDate,
    ) => {
        return {
            type: CIRCUIT_BREAKER_STATE.ISOLATED,
        };
    };
}

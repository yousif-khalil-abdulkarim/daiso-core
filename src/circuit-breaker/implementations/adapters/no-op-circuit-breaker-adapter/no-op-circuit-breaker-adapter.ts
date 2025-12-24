/**
 * @module CircuitBreaker
 */

import {
    CIRCUIT_BREAKER_STATE,
    type CircuitBreakerState,
    type CircuitBreakerStateTransition,
    type ICircuitBreakerAdapter,
} from "@/circuit-breaker/contracts/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/no-op-circuit-breaker-adapter"`
 * @group Adapters
 */
export class NoOpCircuitBreakerAdapter implements ICircuitBreakerAdapter {
    getState(_key: string): Promise<CircuitBreakerState> {
        return Promise.resolve(CIRCUIT_BREAKER_STATE.CLOSED);
    }

    updateState(_key: string): Promise<CircuitBreakerStateTransition> {
        return Promise.resolve({
            from: CIRCUIT_BREAKER_STATE.CLOSED,
            to: CIRCUIT_BREAKER_STATE.CLOSED,
        } satisfies CircuitBreakerStateTransition);
    }

    isolate(_key: string): Promise<void> {
        return Promise.resolve();
    }

    trackFailure(_key: string): Promise<void> {
        return Promise.resolve();
    }

    trackSuccess(_key: string): Promise<void> {
        return Promise.resolve();
    }

    reset(_key: string): Promise<void> {
        return Promise.resolve();
    }
}

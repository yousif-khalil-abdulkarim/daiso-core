/**
 * @module CircuitBreaker
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type OpenCircuitBreakerError } from "@/circuit-breaker/contracts/circuit-breaker.errors.js";
import type { Task } from "@/task/_module.js";
import type { AsyncLazy } from "@/utilities/_module.js";
import type { CircuitBreakerState } from "@/circuit-breaker/contracts/circuit-breaker-state.contract.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type ICircuitBreakerStateMethods = {
    getState(): Task<CircuitBreakerState>;

    /**
     * The `key` of the `ICircuitBreaker` instance.
     */
    readonly key: string;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type ICircuitBreaker = ICircuitBreakerStateMethods & {
    /**
     * The `runOrFail` method runs `asyncFn` in when the circuit breaker is in closed state and half opend state.
     * Throws an error when in opend state.
     *
     * @throws {OpenCircuitBreakerError} {@link OpenCircuitBreakerError}
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue>;

    /**
     * The `isolate` method will transition the circuit breaker to isolated state, meaning the circuit breaker will reject all attempts untill it is manually reset.
     */
    isolate(): Task<void>;

    /**
     * The `reset` method resets circuit breaker to its initial state regardless of the current state.
     */
    reset(): Task<void>;
};

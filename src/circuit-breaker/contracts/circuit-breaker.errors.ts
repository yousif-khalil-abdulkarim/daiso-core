/**
 * @module CircuitBreaker
 */

/**
 * The error is thrown when circuit breaker is in open state and will not allow any attempts.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Errors
 */
export class OpenCircuitBreakerError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = OpenCircuitBreakerError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Errors
 */
export const CIRCUIT_BREAKER_ERRORS = {
    OpenCircuitBreaker: OpenCircuitBreakerError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Errors
 */
export type AllCircuitBreakerErrors = OpenCircuitBreakerError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Errors
 */
export function isCircuitBreakerError(
    value: unknown,
): value is AllCircuitBreakerErrors {
    for (const ErrorClass of Object.values(CIRCUIT_BREAKER_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}

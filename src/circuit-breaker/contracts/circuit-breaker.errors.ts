/**
 * @module CircuitBreaker
 */

import { type Key } from "@/namespace/_module.js";

/**
 * The error is thrown when circuit breaker is in open state and will not allow any attempts.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Errors
 */
export class OpenCircuitBreakerError extends Error {
    static create(key: Key, cause?: unknown): OpenCircuitBreakerError {
        return new OpenCircuitBreakerError(
            `Blocked by circuit breaker with key of "${key.get()}"`,
            cause,
        );
    }

    /**
     * Note: Do not instantiate `OpenCircuitBreakerError` directly via the constructor. Use the static `create()` factory method instead.
     * The constructor remains public only to maintain compatibility with errorPolicy types and prevent type errors.
     * @internal
     */
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
    Open: OpenCircuitBreakerError,
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

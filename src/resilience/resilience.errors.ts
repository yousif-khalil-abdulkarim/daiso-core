/**
 * @module Resilience
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export class TimeoutResilienceError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TimeoutResilienceError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export class RetryResilienceError extends AggregateError {
    constructor(errors: unknown[], message: string) {
        super(errors, message);
        this.name = RetryResilienceError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export const RESILIENCE_ERRORS = {
    Retry: RetryResilienceError,
    Timeout: TimeoutResilienceError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export type AllResilienceErrors = RetryResilienceError | TimeoutResilienceError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export function isResilienceError(
    value: unknown,
): value is AllResilienceErrors {
    for (const ErrorClass of Object.values(RESILIENCE_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}

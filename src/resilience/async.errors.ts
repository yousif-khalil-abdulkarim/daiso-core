/**
 * @module Async
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export class ResilienceError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = ResilienceError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export class TimeoutResilienceError extends ResilienceError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = TimeoutResilienceError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export class HedgingResilienceError extends ResilienceError {
    constructor(
        message: string,
        public readonly errors: unknown[],
    ) {
        super(message, errors);
        this.name = HedgingResilienceError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export class CapacityFullResilienceError extends ResilienceError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = CapacityFullResilienceError.name;
    }
}
/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/resilience"`
 * @group Errors
 */
export const ASYNC_ERRORS = {
    Base: ResilienceError,
    Timeout: TimeoutResilienceError,
    Hedging: HedgingResilienceError,
    CapacityFull: CapacityFullResilienceError,
} as const;

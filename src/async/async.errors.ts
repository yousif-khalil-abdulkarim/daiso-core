/**
 * @module Async
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class AsyncError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AsyncError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class TimeoutAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = TimeoutAsyncError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class HedgingAsyncError extends AsyncError {
    constructor(
        message: string,
        public readonly errors: unknown[],
    ) {
        super(message, errors);
        this.name = HedgingAsyncError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class CapacityFullAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = CapacityFullAsyncError.name;
    }
}
/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export const ASYNC_ERRORS = {
    Base: AsyncError,
    Timeout: TimeoutAsyncError,
    Hedging: HedgingAsyncError,
    CapacityFull: CapacityFullAsyncError,
} as const;

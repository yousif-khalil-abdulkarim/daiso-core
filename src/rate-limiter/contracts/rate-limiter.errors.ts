/**
 * @module RateLimiter
 */

import type { RateLimiterBlockedState } from "@/rate-limiter/contracts/rate-limiter-state.contract.js";

/**
 * The error is throw when rate limiter start to block the attempts.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Errors
 */
export class BlockedRateLimiterError extends Error {
    constructor(
        public readonly state: Omit<RateLimiterBlockedState, "type">,
        message?: string,
        cause?: unknown,
    ) {
        super(message, { cause });
        this.name = BlockedRateLimiterError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Errors
 */
export const CIRCUIT_BREAKER_ERRORS = {
    Blocked: BlockedRateLimiterError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Errors
 */
export type AllRateLimiterErrors = BlockedRateLimiterError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Errors
 */
export function isRateLimiterError(
    value: unknown,
): value is AllRateLimiterErrors {
    for (const ErrorClass of Object.values(CIRCUIT_BREAKER_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}

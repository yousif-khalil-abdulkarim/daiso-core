/**
 * @module RateLimiter
 */

import type { ITimeSpan } from "@/time-span/contracts/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export const RATE_LIMITER_STATE = {
    BLOCKED: "BLOCKED",
    ALLOWED: "ALLOWED",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type RateLimiterStateLiterals =
    (typeof RATE_LIMITER_STATE)[keyof typeof RATE_LIMITER_STATE];

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type RateLimiterAllowedState = {
    type: (typeof RATE_LIMITER_STATE)["ALLOWED"];
    usedAttempts: number;
    reaminingAttemps: number;
    limit: number;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type RateLimiterBlockedState = {
    type: (typeof RATE_LIMITER_STATE)["BLOCKED"];
    limit: number;
    totalAttempts: number;
    exceedAttempts: number;
    resetTime: ITimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type RateLimiterState =
    | RateLimiterBlockedState
    | RateLimiterAllowedState;

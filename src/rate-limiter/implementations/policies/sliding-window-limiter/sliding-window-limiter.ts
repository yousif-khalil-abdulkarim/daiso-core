/**
 * @module RateLimiter
 */

import type { IRateLimiterPolicy } from "@/rate-limiter/contracts/rate-limiter-policy.contract.js";
import {
    TO_MILLISECONDS,
    type ITimeSpan,
} from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export type SlidingWindowLimiterSettings = {
    /**
     * How many attempts are allowed per window.
     *
     * @default 10
     */
    attempts?: number;

    /**
     * The time span in which `maxAttempts` are allowed.
     *
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(1)
     * ```
     */
    timeSpan?: ITimeSpan;
};

/**
 * @internal
 */
export function resolveSlidingWindowLimiterSettings(
    settings: SlidingWindowLimiterSettings,
): Required<SlidingWindowLimiterSettings> {
    const { attempts: maxAttempts = 10, timeSpan = TimeSpan.fromSeconds(1) } = settings;
    if (!Number.isSafeInteger(maxAttempts)) {
        throw new TypeError(
            `"SlidingWindowLimiterSettings.maxAttempts" should be an integer, got float instead`,
        );
    }
    if (maxAttempts < 1) {
        throw new RangeError(
            `"SlidingWindowLimiterSettings.maxAttempts" should be a positive, got ${String(maxAttempts)}`,
        );
    }
    return {
        attempts: maxAttempts,
        timeSpan,
    };
}

/**
 * @internal
 */
export type SerializedSlidingWindowLimiterSettings = {
    maxAttempts?: number;
    timeSpan?: number;
};

/**
 * @internal
 */
export function serializeSlidingWindowLimiterSettings(
    settings: SlidingWindowLimiterSettings,
): Required<SerializedSlidingWindowLimiterSettings> {
    const { attempts: maxAttempts, timeSpan } =
        resolveSlidingWindowLimiterSettings(settings);
    return {
        maxAttempts,
        timeSpan: timeSpan[TO_MILLISECONDS](),
    };
}

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export type SlidingWindowLimiterState = {
    attempt: number;
};

/**
 * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
 * costs than `slidingLogs` and improved boundary behavior by calculating a
 * weighted score between two windows.
 *
 * **Pro:**
 *
 * Good performance allows this to scale to very high loads.
 *
 * **Con:**
 *
 * Nothing major.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export class SlidingWindowLimiter
    implements IRateLimiterPolicy<SlidingWindowLimiterState>
{
    constructor(settings: SlidingWindowLimiterSettings = {}) {}

    initialMetrics(): SlidingWindowLimiterState {
        throw new Error("Method not implemented.");
    }

    shouldBlock(
        currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): boolean {
        throw new Error("Method not implemented.");
    }

    getExpiration?(currentMetrics: SlidingWindowLimiterState): TimeSpan {
        throw new Error("Method not implemented.");
    }

    getAttempts(currentMetrics: SlidingWindowLimiterState): number {
        return currentMetrics.attempt;
    }

    updateMetrics(
        currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): SlidingWindowLimiterState {
        throw new Error("Method not implemented.");
    }

    isEqual?(
        metricsA: SlidingWindowLimiterState,
        metricsB: SlidingWindowLimiterState,
    ): boolean {
        throw new Error("Method not implemented.");
    }
}

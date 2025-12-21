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
export type FixedWindowLimiterSettings = {
    /**
     * How many attempts are allowed per window.
     *
     * @default 10
     */
    limit?: number;

    /**
     * The time span in which `limit` are allowed.
     *
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(1)
     * ```
     */
    window?: ITimeSpan;
};

/**
 * @internal
 */
export function resolveFixedWindowLimiterSettings(
    settings: FixedWindowLimiterSettings,
): Required<FixedWindowLimiterSettings> {
    const { limit = 10, window = TimeSpan.fromSeconds(1) } = settings;
    if (!Number.isSafeInteger(limit)) {
        throw new TypeError(
            `"FixedWindowLimiterSettings.limit" should be an integer, got float instead`,
        );
    }
    if (limit < 1) {
        throw new RangeError(
            `"FixedWindowLimiterSettings.limit" should be a positive, got ${String(limit)}`,
        );
    }
    return {
        limit,
        window,
    };
}

/**
 * @internal
 */
export type SerializedFixedWindowLimiterSettings = {
    limit?: number;
    window?: number;
};

/**
 * @internal
 */
export function serializeFixedWindowLimiterSettings(
    settings: FixedWindowLimiterSettings,
): Required<SerializedFixedWindowLimiterSettings> {
    const { limit, window } = resolveFixedWindowLimiterSettings(settings);
    return {
        limit,
        window: window[TO_MILLISECONDS](),
    };
}

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export type FixedWindowLimiterState = {
    limit: number;

    /**
     * Unix timestamp in ms
     */
    lastAttemptAt: number;
};

/**
 * Each request inside a fixed time increases a counter.
 * Once the counter reaches the maximum allowed number, all further attempts are
 * rejected.
 *
 * **Pro:**
 *
 * - Newer attempts are not starved by old ones.
 * - Low storage cost.
 *
 * **Con:**
 *
 * A burst of attempts near the boundary of a window can result in a very
 * high request rate because two windows will be filled with attempts quickly.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export class FixedWindowLimiter
    implements IRateLimiterPolicy<FixedWindowLimiterState>
{
    private readonly limit: number;
    private readonly window: TimeSpan;

    constructor(settings: FixedWindowLimiterSettings = {}) {
        const { limit, window } = resolveFixedWindowLimiterSettings(settings);
        this.limit = limit;
        this.window = TimeSpan.fromTimeSpan(window);
    }

    initialMetrics(currentDate: Date): FixedWindowLimiterState {
        return {
            limit: 0,
            lastAttemptAt: currentDate.getTime(),
        };
    }

    shouldBlock(
        currentMetrics: FixedWindowLimiterState,
        currentDate: Date,
    ): boolean {
        const timeSinceLastAttempt =
            currentDate.getTime() - currentMetrics.lastAttemptAt;
        return (
            timeSinceLastAttempt < this.window.toMilliseconds() &&
            currentMetrics.limit >= this.limit
        );
    }

    getExpiration(
        currentMetrics: FixedWindowLimiterState,
        _currentDate: Date,
    ): Date {
        return this.window.toEndDate(new Date(currentMetrics.lastAttemptAt));
    }

    getAttempts(
        currentMetrics: FixedWindowLimiterState,
        _currentDate: Date,
    ): number {
        return currentMetrics.limit;
    }

    updateMetrics(
        currentMetrics: FixedWindowLimiterState,
        currentDate: Date,
    ): FixedWindowLimiterState {
        return {
            limit: currentMetrics.limit + 1,
            lastAttemptAt: currentDate.getTime(),
        };
    }

    isEqual(
        metricsA: FixedWindowLimiterState,
        metricsB: FixedWindowLimiterState,
    ): boolean {
        return (
            metricsA.limit === metricsB.limit &&
            metricsA.lastAttemptAt === metricsB.lastAttemptAt
        );
    }
}

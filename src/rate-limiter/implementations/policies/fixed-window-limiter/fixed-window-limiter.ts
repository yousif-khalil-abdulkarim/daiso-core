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
    maxAttempt?: number;

    /**
     * The time span in which `maxAttempt` are allowed.
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
    const { maxAttempt: attempts = 10, window = TimeSpan.fromSeconds(1) } =
        settings;
    if (!Number.isSafeInteger(attempts)) {
        throw new TypeError(
            `"FixedWindowLimiterSettings.maxAttempt" should be an integer, got float instead`,
        );
    }
    if (attempts < 1) {
        throw new RangeError(
            `"FixedWindowLimiterSettings.maxAttempt" should be a positive, got ${String(attempts)}`,
        );
    }
    return {
        maxAttempt: attempts,
        window,
    };
}

/**
 * @internal
 */
export type SerializedFixedWindowLimiterSettings = {
    maxAttempt?: number;
    window?: number;
};

/**
 * @internal
 */
export function serializeFixedWindowLimiterSettings(
    settings: FixedWindowLimiterSettings,
): Required<SerializedFixedWindowLimiterSettings> {
    const { maxAttempt, window } = resolveFixedWindowLimiterSettings(settings);
    return {
        maxAttempt,
        window: window[TO_MILLISECONDS](),
    };
}

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export type FixedWindowLimiterState = {
    maxAttempt: number;

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
    private readonly maxAttempt: number;
    private readonly window: TimeSpan;

    constructor(settings: FixedWindowLimiterSettings = {}) {
        const { maxAttempt, window } =
            resolveFixedWindowLimiterSettings(settings);
        this.maxAttempt = maxAttempt;
        this.window = TimeSpan.fromTimeSpan(window);
    }

    initialMetrics(currentDate: Date): FixedWindowLimiterState {
        return {
            maxAttempt: 0,
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
            currentMetrics.maxAttempt >= this.maxAttempt
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
        return currentMetrics.maxAttempt;
    }

    updateMetrics(
        currentMetrics: FixedWindowLimiterState,
        currentDate: Date,
    ): FixedWindowLimiterState {
        return {
            maxAttempt: currentMetrics.maxAttempt + 1,
            lastAttemptAt: currentDate.getTime(),
        };
    }

    isEqual(
        metricsA: FixedWindowLimiterState,
        metricsB: FixedWindowLimiterState,
    ): boolean {
        return (
            metricsA.maxAttempt === metricsB.maxAttempt &&
            metricsA.lastAttemptAt === metricsB.lastAttemptAt
        );
    }
}

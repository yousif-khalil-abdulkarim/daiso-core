/**
 * @module RateLimiter
 */

import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type IRateLimiterPolicy<TMetrics = unknown> = {
    initialMetrics(): TMetrics;

    shouldBlock(currentMetrics: TMetrics, currentDate: Date): boolean;

    /**
     * The `getExpiration` method should return the expiration as `TimeSpan`.
     * This method is optional, if defined rate limiter data will be cleaned up when expired.
     * If not defined the rate limiter data will be stored forever.
     */
    getExpiration?(currentMetrics: TMetrics): TimeSpan;

    /**
     * The `getAttempts` method returns amount of used attempts.
     */
    getAttempts(currentMetrics: TMetrics): number;

    /**
     * The `updateMetrics` method updates the metrics when an attempt occurs.
     */
    updateMetrics(currentMetrics: TMetrics, currentDate: Date): TMetrics;

    /**
     * The `isEqual` method should return true only when both metrics are equal.
     * This method is optional, it is only used for optimization purposes.
     */
    isEqual?(metricsA: TMetrics, metricsB: TMetrics): boolean;
};

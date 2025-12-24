/**
 * @module RateLimiter
 */

/**
 * The `IRateLimiterPolicy` contract defines the rate limiter algorithm.
 * Note all the methods here are pure functions, meaning they should return copies and not mutate input data.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type IRateLimiterPolicy<TMetrics = unknown> = {
    initialMetrics(currentDate: Date): TMetrics;

    shouldBlock(
        currentMetrics: TMetrics,
        limit: number,
        currentDate: Date,
    ): boolean;

    /**
     * The `getExpiration` method should return the expiration as `Date`.
     * This method is optional, if defined rate limiter data will be cleaned up when expired.
     * If not defined the rate limiter data will be stored forever.
     */
    getExpiration(currentMetrics: TMetrics, currentDate: Date): Date;

    /**
     * The `getAttempts` method returns amount of used attempts.
     */
    getAttempts(currentMetrics: TMetrics, currentDate: Date): number;

    /**
     * The `updateMetrics` method updates the metrics when an attempt occurs.
     */
    updateMetrics(currentMetrics: TMetrics, currentDate: Date): TMetrics;
};

/**
 * @module RateLimiter
 */

import {
    exponentialBackoff,
    type BackoffPolicy,
} from "@/backoff-policies/_module-exports.js";
import type {
    IRateLimiterAdapter,
    IRateLimiterAdapterState,
    IRateLimiterPolicy,
    IRateLimiterStorageAdapter,
} from "@/rate-limiter/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import {
    RateLimiterPolicy,
    type AllRateLimiterState,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";
import { RateLimiterStorage } from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-storage.js";
import { RateLimiterStateManager } from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-state-manager.js";
import { FixedWindowLimiter } from "@/rate-limiter/implementations/policies/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/database-rate-limiter-adapter"`
 * @group Adapters
 */
export type DatabaseRateLimiterAdapterSettings = {
    adapter: IRateLimiterStorageAdapter;

    /**
     * You can define your own {@link BackoffPolicy | `BackoffPolicy`}.
     * @default
     * ```ts
     * import { exponentialBackoff } from "@daiso-tech/core/backoff-policies";
     *
     * exponentialBackoff();
     * ```
     */
    backoffPolicy?: BackoffPolicy;

    /**
     * You can define your own {@link IRateLimiterPolicy | `IRateLimiterPolicy`}.
     * @default
     * ```ts
     * import { FixedWindowLimiter } from "@daiso-tech/core/rate-limiter/policies";
     *
     * new FixedWindowLimiter();
     * ```
     */
    rateLimiterPolicy?: IRateLimiterPolicy;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/database-rate-limiter-adapter"`
 * @group Adapters
 */
export class DatabaseRateLimiterAdapter<TMetrics = unknown>
    implements IRateLimiterAdapter
{
    private readonly rateLimiterStorage: RateLimiterStorage<TMetrics>;
    private readonly rateLimiterStateManager: RateLimiterStateManager<TMetrics>;

    constructor(settings: DatabaseRateLimiterAdapterSettings) {
        const {
            adapter,
            backoffPolicy = exponentialBackoff(),
            rateLimiterPolicy = new FixedWindowLimiter(),
        } = settings;
        const internalRateLimiterPolicy = new RateLimiterPolicy(
            rateLimiterPolicy as IRateLimiterPolicy<TMetrics>,
        );
        this.rateLimiterStorage = new RateLimiterStorage({
            adapter: adapter as IRateLimiterStorageAdapter<
                AllRateLimiterState<TMetrics>
            >,
            rateLimiterPolicy: internalRateLimiterPolicy,
            backoffPolicy,
        });
        this.rateLimiterStateManager = new RateLimiterStateManager(
            internalRateLimiterPolicy,
            backoffPolicy,
        );
    }

    async getState(
        key: string,
        limit: number,
    ): Promise<IRateLimiterAdapterState> {
        const state = await this.rateLimiterStorage.find(key, limit);
        return {
            ...state,
            resetTime:
                state.resetTime === null
                    ? null
                    : TimeSpan.fromDateRange({
                          end: state.resetTime,
                      }),
        };
    }

    async updateState(
        key: string,
        limit: number,
    ): Promise<IRateLimiterAdapterState> {
        const currentDate = new Date();
        const state = await this.rateLimiterStorage.atomicUpdate({
            key,
            limit,
            update: (state) => {
                return this.rateLimiterStateManager.updateState(currentDate)(
                    this.rateLimiterStateManager.track(currentDate)(state),
                );
            },
        });
        return {
            ...state,
            resetTime:
                state.resetTime === null
                    ? null
                    : TimeSpan.fromDateRange({
                          end: state.resetTime,
                      }),
        };
    }

    async reset(key: string): Promise<void> {
        await this.rateLimiterStorage.remove(key);
    }
}

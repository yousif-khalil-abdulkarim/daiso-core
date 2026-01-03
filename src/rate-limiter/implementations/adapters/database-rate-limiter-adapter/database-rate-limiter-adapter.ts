/**
 * @module RateLimiter
 */

import {
    exponentialBackoff,
    type BackoffPolicy,
} from "@/backoff-policies/_module.js";
import {
    type IRateLimiterAdapter,
    type IRateLimiterAdapterState,
    type IRateLimiterPolicy,
    type IRateLimiterStorageAdapter,
} from "@/rate-limiter/contracts/_module.js";
import {
    RateLimiterPolicy,
    type AllRateLimiterState,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";
import { RateLimiterStateManager } from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-state-manager.js";
import { RateLimiterStorage } from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-storage.js";
import { FixedWindowLimiter } from "@/rate-limiter/implementations/policies/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

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

    /**
     * @example
     * ```ts
     * import { DatabaseRateLimiterAdapter } from "@daiso-tech/core/rate-limiter/database-rate-limiter-adapter";
     * import { MemoryRateLimiterStorageAdapter } from "@daiso-tech/core/rate-limiter/memory-rate-limiter-storage-adapter";
     *
     * const rateLimiterStorageAdapter = new MemoryRateLimiterStorageAdapter();
     * const rateLimiterAdapter = new DatabaseRateLimiterAdapter({
     *   adapter: rateLimiterStorageAdapter
     * });
     * ```
     */
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

    async getState(key: string): Promise<IRateLimiterAdapterState | null> {
        const state = await this.rateLimiterStorage.find(key);
        if (state === null) {
            return null;
        }
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
            update: (state) => {
                return this.rateLimiterStateManager.updateState(
                    limit,
                    currentDate,
                )(this.rateLimiterStateManager.track(currentDate)(state));
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

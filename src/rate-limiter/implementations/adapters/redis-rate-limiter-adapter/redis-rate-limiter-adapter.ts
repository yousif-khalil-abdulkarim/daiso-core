/**
 * @module RateLimiter
 */

import {
    BACKOFFS,
    resolveBackoffSettingsEnum,
    type BackoffSettingsEnum,
} from "@/backoff-policies/_module-exports.js";
import type { Redis } from "ioredis";
import {
    LIMITER_POLICIES,
    resolveRateLimiterPolicySettings,
    type RateLimiterPolicySettingsEnum,
} from "@/rate-limiter/implementations/policies/_module-exports.js";
import type {
    IRateLimiterAdapter,
    IRateLimiterAdapterState,
} from "@/rate-limiter/contracts/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/redis-rate-limiter-adapter"`
 * @group Adapters
 */
export type RedisRateLimiterAdapterSettings = {
    database: Redis;

    /**
     * You can choose between different types of predefined backoff policies.
     * @default
     * ```ts
     * { type: BACKOFFS.EXPONENTIAL }
     * ```
     */
    backoff?: BackoffSettingsEnum;

    /**
     * You can choose between different types of predefined circuit breaker policies.
     * @default
     * ```ts
     * { type: POLICIES.CONSECUTIVE }
     * ```
     */
    policy?: RateLimiterPolicySettingsEnum;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/redis-rate-limiter-adapter"`
 * @group Adapters
 */
export class RedisRateLimiterAdapter implements IRateLimiterAdapter {
    private readonly backoff: Required<BackoffSettingsEnum>;

    private readonly policy: Required<RateLimiterPolicySettingsEnum>;

    private readonly database: Redis;

    /**
     * @example
     * ```ts
     * import { RedisRateLimiterAdapter } from "@daiso-tech/core/rate-limiter/redis-rate-limiter-adapter";
     * import Redis from "ioredis";
     *
     * const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const rateLimiterAdapter = new RedisRateLimiterAdapter({
     *   database
     * });
     * ```
     */
    constructor(settings: RedisRateLimiterAdapterSettings) {
        const {
            database,
            backoff = {
                type: BACKOFFS.EXPONENTIAL,
            },
            policy = {
                type: LIMITER_POLICIES.FIXED_WINDOW,
            },
        } = settings;

        this.database = database;
        this.backoff = resolveBackoffSettingsEnum(backoff);
        this.policy = resolveRateLimiterPolicySettings(policy);
    }

    getState(
        key: string,
        limit: number,
    ): Promise<IRateLimiterAdapterState | null> {
        throw new Error("Method not implemented.");
    }

    updateState(key: string, limit: number): Promise<IRateLimiterAdapterState> {
        throw new Error("Method not implemented.");
    }

    reset(key: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

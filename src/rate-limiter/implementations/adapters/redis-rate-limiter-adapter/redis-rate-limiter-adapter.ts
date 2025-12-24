/**
 * @module RateLimiter
 */

import {
    BACKOFFS,
    resolveBackoffSettingsEnum,
    serializeBackoffSettingsEnum,
    type BackoffSettingsEnum,
} from "@/backoff-policies/_module.js";
import type { Redis, Result } from "ioredis";
import {
    LIMITER_POLICIES,
    resolveRateLimiterPolicySettings,
    serializeRateLimiterPolicySettingsEnum,
    type RateLimiterPolicySettingsEnum,
} from "@/rate-limiter/implementations/policies/_module.js";
import type {
    IRateLimiterAdapter,
    IRateLimiterAdapterState,
} from "@/rate-limiter/contracts/_module.js";
import { TimeSpan } from "@/time-span/implementations/time-span.js";
import { rateLimiterFactoryLua } from "@/rate-limiter/implementations/adapters/redis-rate-limiter-adapter/lua/_module.js";

/**
 * @internal
 */
type IRedisJsonRateLimiterState = {
    success: boolean;
    attempt: number;
    resetTime: number;
};

declare module "ioredis" {
    interface RedisCommander<Context> {
        /**
         * @returns {string} {@link IRedisJsonRateLimiterState | `IRedisJsonRateLimiterState | null`} as json string.
         */
        daiso_rate_limiter_update_state(
            key: string,
            limit: number,
            backoffSettings: string,
            policySettings: string,
            currentDate: number,
        ): Result<string, Context>;
    }
}

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
     * { type: LIMITER.FIXED_WINDOW }
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
        this.initUpdateStateCommmand();
    }

    private initUpdateStateCommmand(): void {
        if (
            typeof this.database.daiso_rate_limiter_update_state === "function"
        ) {
            return;
        }

        this.database.defineCommand("daiso_rate_limiter_update_state", {
            numberOfKeys: 1,
            lua: `
            ${rateLimiterFactoryLua}

            local key = KEYS[1];
            local limit = tonumber(ARGV[1]);
            local backoffSettings = cjson.decode(ARGV[2]);
            local policySettings = cjson.decode(ARGV[3]);
            local currentDate = tonumber(ARGV[4]);

            local rateLimiter = rateLimiterFactory(backoffSettings, policySettings, currentDate)
            local state = rateLimiter.updateState(key, limit)
            return cjson.encode(state)
            `,
        });
    }

    async getState(key: string): Promise<IRateLimiterAdapterState | null> {
        const json = await this.database.get(key);
        if (json === null) {
            return null;
        }
        const state = JSON.parse(json) as IRedisJsonRateLimiterState;
        return {
            success: state.success,
            attempt: state.attempt,
            resetTime:
                state.resetTime === -1
                    ? null
                    : TimeSpan.fromDateRange({
                          end: new Date(state.resetTime),
                      }),
        };
    }

    async updateState(
        key: string,
        limit: number,
    ): Promise<IRateLimiterAdapterState> {
        const json = await this.database.daiso_rate_limiter_update_state(
            key,
            limit,
            JSON.stringify(serializeBackoffSettingsEnum(this.backoff)),
            JSON.stringify(serializeRateLimiterPolicySettingsEnum(this.policy)),
            Date.now(),
        );
        const state = JSON.parse(json) as IRedisJsonRateLimiterState;
        return {
            success: state.success,
            attempt: state.attempt,
            resetTime:
                state.resetTime === -1
                    ? null
                    : TimeSpan.fromDateRange({
                          end: new Date(state.resetTime),
                      }),
        };
    }

    async reset(key: string): Promise<void> {
        await this.database.del(key);
    }
}

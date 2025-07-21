/**
 * @module Semaphore
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type {
    ISemaphoreAdapter,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/_module-exports.js";
import type { Redis, Result } from "ioredis";

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_semaphore_acquire(
            key: string,
            slotId: string,
            limit: number,
            expiration: number | null,
            now: number,
        ): Result<number, Context>;

        daiso_semaphore_release(
            key: string,
            slotId: string,
            now: number,
        ): Result<void, Context>;

        daiso_semaphore_refresh(
            key: string,
            slotId: string,
            newExpiration: number,
            now: number,
        ): Result<number, Context>;
    }
}

/**
 * To utilize the `RedisSemaphoreAdapter`, you must install the `"ioredis"` package.
 *
 * Note in order to use `RedisSemaphoreAdapter` correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export class RedisSemaphoreAdapter implements ISemaphoreAdapter {
    constructor(private readonly database: Redis) {
        this.initAquireCommand();
        this.initReleaseCommand();
        this.initRefreshComand();
    }

    private initAquireCommand(): void {
        if (typeof this.database.daiso_lock_acquire === "function") {
            return;
        }

        this.database.defineCommand("daiso_lock_acquire", {
            numberOfKeys: 1,
            lua: `
                local key = KEYS[1]
                local slotId = ARGV[1]
                local limit = tonumber(ARGV[2])
                -- unix timestamp in ms
                local expiration = tonumber(ARGV[3])
                -- unix timestamp in ms
                local now = tonumber(ARGV[4])

                -- Removes all expired slots
                redis.call("zremrangebyscore", key, 1, now + 1)

                local isLimitReached = tonumber(redis.call("zcard", key)) >= limit
                if isLimitReached then
                    return 0
                end

                local isSlotNotExpirable = expiration == null  
                if isSlotNotExpirable then
                    redis.call("zadd", key, 0, slotId)
                    redis.call("persist", key) 
                else
                    redis.call("zadd", key, expiration, slotId)
                    redis.call("pexpireat", key, expiration)
                end

                local hasAtLeastOneUnexpirableSlot = tonumber(redis.call("zcount", key, 0, 0)) > 0;
                if hasAtLeastOneUnexpirableSlot then
                    redis.call("persist", key) 
                end

                return 1
            `,
        });
    }

    private initReleaseCommand(): void {
        if (typeof this.database.daiso_lock_release === "function") {
            return;
        }

        this.database.defineCommand("daiso_lock_release", {
            numberOfKeys: 1,
            lua: `
                local key = KEYS[1]
                local slotId = ARGV[1]
                -- unix timestamp in ms
                local now = tonumber(ARGV[4])
                
                -- Removes all expired slots
                redis.call("zremrangebyscore", key, 1, now + 1)

                -- Removes the given slot
                redis.call("zrem", key, slotId)

                local hasAtLeastOneUnexpirableSlot = tonumber(redis.call("zcount", key, 0, 0)) > 0;
                if hasAtLeastOneUnexpirableSlot then
                    redis.call("persist", key)
                    return 
                end

                local longestExpiration = tonumber(redis.call("zrange", key, 0, 0, "BYSCORE", "REV", "WITHSCORES")[2])
                redis.call("pexpireat", longestExpiration)
            `,
        });
    }

    private initRefreshComand(): void {
        if (typeof this.database.daiso_lock_refresh === "function") {
            return;
        }

        this.database.defineCommand("daiso_lock_refresh", {
            numberOfKeys: 1,
            lua: `
                local key = KEYS[1]
                local slotId = ARGV[1]
                -- unix timestamp in ms
                local newExpiration = tonumber(ARGV[2])
                -- unix timestamp in ms
                local now = tonumber(ARGV[4])

                -- Removes all expired slots
                redis.call("zremrangebyscore", key, 1, now + 1)

                local expiration = tonumber(redis.call("zscore", key, slotId));
                local hasExpiredOrDoesNotExist = expiration == nil
                if hasExpiredOrDoesNotExist then
                    return 0
                end
                
                -- Update expiration if slotId exists
                redis.call("zadd", key, "xx", newExpiration, slotId)

                return 1
            `,
        });
    }

    async acquire(settings: SemaphoreAcquireSettings): Promise<boolean> {
        const { key, slotId, limit, ttl } = settings;
        const result = await this.database.daiso_semaphore_acquire(
            key,
            slotId,
            limit,
            ttl?.toEndDate().getTime() ?? null,
            Date.now(),
        );
        return result === 1;
    }

    async release(key: string, slotId: string): Promise<void> {
        await this.database.daiso_semaphore_release(key, slotId, Date.now());
    }

    async forceReleaseAll(key: string): Promise<void> {
        await this.database.del(key);
    }

    async refresh(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const result = await this.database.daiso_semaphore_refresh(
            key,
            slotId,
            ttl.toEndDate().getTime(),
            Date.now(),
        );
        return result === 1;
    }
}

/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    LOCK_REFRESH_RESULT,
    type ILockAdapter,
    type LockRefreshResult,
} from "@/lock/contracts/_module-exports.js";
import type { Redis } from "ioredis";
import type { Result } from "ioredis";

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_lock_acquire(
            key: string,
            owner: string,
            expiration: string,
        ): Result<number, Context>;
        daiso_lock_release(key: string, owner: string): Result<number, Context>;
        daiso_lock_refresh(
            key: string,
            owner: string,
            expiration: string,
            REFRESHED: typeof LOCK_REFRESH_RESULT.REFRESHED,
            UNOWNED_REFRESH: typeof LOCK_REFRESH_RESULT.UNOWNED_REFRESH,
            UNEXPIRABLE_KEY: typeof LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY,
        ): Result<LockRefreshResult, Context>;
    }
}

/**
 * To utilize the `RedisLockAdapter`, you must install the [`"ioredis"`](https://www.npmjs.com/package/ioredis) package.
 *
 * Note in order to use `RedisLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class RedisLockAdapter implements ILockAdapter {
    /**
     * @example
     * ```ts
     * import { RedisLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import Redis from "ioredis";
     *
     * const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const lockAdapter = new RedisLockAdapter(database);
     * ```
     */
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
                local key = KEYS[1];
                local owner = ARGV[1];
                local expiration = tonumber(ARGV[2])

                if redis.call("exists", key) == 1 then
                    return 0
                end
                
                if expiration == nil then
                    redis.call("set", key, owner, "nx")
                else
                    redis.call("set", key, owner, "px", expiration, "nx")
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
                local key = KEYS[1];
                local owner = ARGV[1];

                if redis.call("exists", key) == 0 then
                    return 0
                end

                local isNotCurrentOwner = redis.call("get", key) ~= owner
                if isNotCurrentOwner then
                    return 0
                end

                redis.call("del", key)
                
                return 1
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
                -- Arguments
                local key = KEYS[1];
                local owner = ARGV[1];
                local expiration = ARGV[2]

                -- Constant values
                local REFRESHED = ARGV[3]
                local UNOWNED_REFRESH = ARGV[4]
                local UNEXPIRABLE_KEY = ARGV[5]

                if redis.call("exists", key) == 0 then
                    return UNOWNED_REFRESH
                end
                
                local isNotCurrentOwner = redis.call("get", key) ~= owner
                if redis.call("get", key) ~= owner then
                    return UNOWNED_REFRESH
                end

                local currentExpiration = redis.call("pttl", key)
                local isUnexpireable = currentExpiration == -1
                if isUnexpireable then
                    return UNEXPIRABLE_KEY
                end

                redis.call("pexpire", key, expiration)
                return REFRESHED
            `,
        });
    }

    async acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const result = await this.database.daiso_lock_acquire(
            key,
            owner,
            String(ttl?.toMilliseconds() ?? null),
        );
        return result === 1;
    }

    async release(key: string, owner: string): Promise<boolean> {
        const result = await this.database.daiso_lock_release(key, owner);
        return result === 1;
    }

    async forceRelease(key: string): Promise<boolean> {
        const result = await this.database.del(key);
        return result > 0;
    }

    async refresh(
        key: string,
        owner: string,
        ttl: TimeSpan,
    ): Promise<LockRefreshResult> {
        return await this.database.daiso_lock_refresh(
            key,
            owner,
            ttl.toMilliseconds().toString(),
            LOCK_REFRESH_RESULT.REFRESHED,
            LOCK_REFRESH_RESULT.UNOWNED_REFRESH,
            LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY,
        );
    }
}

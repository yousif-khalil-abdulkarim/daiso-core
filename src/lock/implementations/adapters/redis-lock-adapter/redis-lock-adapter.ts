/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { ILockAdapter } from "@/lock/contracts/_module-exports.js";
import type { Redis } from "ioredis";
import type { Result } from "ioredis";

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_lock_acquire(
            key: string,
            owner: string,
            ttl: string,
        ): Result<number, Context>;
        daiso_lock_release(key: string, owner: string): Result<number, Context>;
        daiso_lock_refresh(
            key: string,
            owner: string,
            ttl: string,
        ): Result<number, Context>;
    }
}

/**
 * To utilize the <i>RedisLockAdapter</i>, you must install the <i>"ioredis"</i> package.
 *
 * Note in order to use <i>RedisLockAdapter</i> correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export class RedisLockAdapter implements ILockAdapter {
    /**
     * @example
     * ```ts
     * import { RedisLockAdapter, SuperJsonSerde } from "@daiso-tech/core/lock/implementations/adapters";
     * import Redis from "ioredis";
     *
     * const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new SuperJsonSerde();
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
                local ttl = ARGV[2]
                
                local hasKey = redis.call("exists", key)
                if hasKey == 1 then
                    return 0
                end
                
                if ttl == "null" then
                    redis.call("set", key, owner, "nx")
                else
                    redis.call("set", key, owner, "px", ttl, "nx")
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

                local owner_ = redis.call("get", key)
                if owner_ == owner then
                    redis.call("del", key)
                    return 1
                end
                
                return 0
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
                local key = KEYS[1];
                local owner = ARGV[1];
                local ttl = ARGV[2]

                local owner_ = redis.call("get", key)
                if owner_ == owner then
                    redis.call("pexpire", key, ttl)
                    return 1
                end
                return 0 
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
        return result > 0;
    }

    async release(key: string, owner: string): Promise<boolean> {
        const result = await this.database.daiso_lock_release(key, owner);
        return result === 1;
    }

    async forceRelease(key: string): Promise<void> {
        await this.database.del(key);
    }

    async refresh(key: string, owner: string, ttl: TimeSpan): Promise<boolean> {
        const result = await this.database.daiso_lock_refresh(
            key,
            owner,
            ttl.toMilliseconds().toString(),
        );
        return Boolean(result);
    }
}

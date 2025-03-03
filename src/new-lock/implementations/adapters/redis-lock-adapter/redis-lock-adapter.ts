/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import { resolveOneOrMoreStr } from "@/utilities/_module-exports.js";
import type { ILockAdapter } from "@/new-lock/contracts/_module-exports.js";
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export type RedisLockAdapterSettings = {
    database: Redis;
    rootGroup: string;
};

/**
 * To utilize the <i>RedisLockAdapter</i>, you must install the <i>"ioredis"</i> package.
 *
 * Note in order to use <i>RedisLockAdapter</i> correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export class RedisLockAdapter implements ILockAdapter {
    private readonly group: string;
    private readonly database: Redis;

    /**
     * @example
     * ```ts
     * import { RedisLockAdapter, SuperJsonSerde } from "@daiso-tech/core/lock/implementations/adapters";
     * import Redis from "ioredis";
     *
     * const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new SuperJsonSerde();
     * const lockAdapter = new RedisLockAdapter({
     *   database,
     *   serde,
     *   rootGroup: "@global"
     * });
     * ```
     */
    constructor(settings: RedisLockAdapterSettings) {
        const { database, rootGroup } = settings;
        this.database = database;
        this.group = rootGroup;
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

    private getPrefix(): string {
        return resolveOneOrMoreStr([this.group, "__KEY__"]);
    }

    private withPrefix(key: string): string {
        return resolveOneOrMoreStr([this.getPrefix(), key]);
    }

    async acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        key = this.withPrefix(key);
        const result = await this.database.daiso_lock_acquire(
            key,
            owner,
            String(ttl?.toMilliseconds() ?? null),
        );
        return result > 0;
    }

    async release(key: string, owner: string): Promise<boolean> {
        key = this.withPrefix(key);
        const result = await this.database.daiso_lock_release(key, owner);
        return result === 1;
    }

    async forceRelease(key: string): Promise<void> {
        key = this.withPrefix(key);
        await this.database.del(key);
    }

    async refresh(key: string, owner: string, ttl: TimeSpan): Promise<boolean> {
        key = this.withPrefix(key);
        const result = await this.database.daiso_lock_refresh(
            key,
            owner,
            ttl.toMilliseconds().toString(),
        );
        return Boolean(result);
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): ILockAdapter {
        return new RedisLockAdapter({
            database: this.database,
            rootGroup: resolveOneOrMoreStr([this.group, group]),
        });
    }
}

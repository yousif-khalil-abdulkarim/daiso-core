/**
 * @module Cache
 */

import {
    TypeCacheError,
    type ICacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import { ReplyError, type Redis, type Result } from "ioredis";
import { ClearIterable } from "@/cache/implementations/adapters/redis-cache-adapter/utilities.js";
import { RedisCacheAdapterSerde } from "@/cache/implementations/adapters/redis-cache-adapter/redis-cache-adapter-serde.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_cache_increment(
            key: string,
            number: string,
        ): Result<number, Context>;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/adapters"```
 * @group Adapters
 */
export type RedisCacheAdapterSettings = {
    database: Redis;
    serde: ISerde<string>;
};

/**
 * To utilize the <i>RedisCacheAdapter</i>, you must install the <i>"ioredis"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, with adapter like <i>{@link SuperJsonSerdeAdapter}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/adapters"```
 * @group Adapters
 */
export class RedisCacheAdapter<TType> implements ICacheAdapter<TType> {
    private static isRedisTypeError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        value: any,
    ): boolean {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (
            value instanceof ReplyError &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            value.message.includes("ERR value is not a valid float")
        );
    }

    private readonly serde: ISerde<string>;
    private readonly database: Redis;

    /**
     * @example
     * ```ts
     * import { RedisCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters"
     * import Redis from "ioredis";
     *
     * const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheAdapter = new RedisCacheAdapter({
     *   database,
     *   serde,
     * });
     * ```
     */
    constructor(settings: RedisCacheAdapterSettings) {
        const { database, serde } = settings;
        this.database = database;
        this.serde = new RedisCacheAdapterSerde(serde);
        this.initIncrementCommand();
    }

    private initIncrementCommand(): void {
        if (typeof this.database.daiso_cache_increment === "function") {
            return;
        }

        this.database.defineCommand("daiso_cache_increment", {
            numberOfKeys: 1,
            lua: `
                local hasKey = redis.call("exists", KEYS[1])
        
                if hasKey == 1 then
                    redis.call("incrbyfloat", KEYS[1], tonumber(ARGV[1]))
                end
                
                return hasKey
                `,
        });
    }

    async get(key: string): Promise<TType | null> {
        const value = await this.database.get(key);
        if (value === null) {
            return null;
        }
        return await this.serde.deserialize(value);
    }

    async getAndRemove(key: string): Promise<TType | null> {
        const value = await this.database.getdel(key);
        if (value === null) {
            return null;
        }
        return this.serde.deserialize(value);
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        if (ttl === null) {
            const result = await this.database.set(
                key,
                this.serde.serialize(value),
                "NX",
            );
            return result === "OK";
        }
        const result = await this.database.set(
            key,
            this.serde.serialize(value),
            "PX",
            ttl.toMilliseconds(),
            "NX",
        );
        return result === "OK";
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        if (ttl === null) {
            const result = await this.database.set(
                key,
                this.serde.serialize(value),
                "GET",
            );
            return result !== null;
        }
        const result = await this.database.set(
            key,
            this.serde.serialize(value),
            "PX",
            ttl.toMilliseconds(),
            "GET",
        );
        return result !== null;
    }

    async update(key: string, value: TType): Promise<boolean> {
        const result = await this.database.set(
            key,
            this.serde.serialize(value),
            "XX",
        );
        return result === "OK";
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const redisResult = await this.database.daiso_cache_increment(
                key,
                this.serde.serialize(value),
            );
            const keyExists = redisResult === 1;
            return keyExists;
        } catch (error: unknown) {
            if (!RedisCacheAdapter.isRedisTypeError(error)) {
                throw error;
            }
            throw new TypeCacheError(
                `Unable to increment or decrement none number type key "${key}"`,
            );
        }
    }

    async removeMany(keys: string[]): Promise<boolean> {
        const deleteResult = await this.database.del(...keys);
        return deleteResult > 0;
    }

    async removeAll(): Promise<void> {
        await this.database.flushdb();
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        for await (const _ of new ClearIterable(this.database, prefix)) {
            /* Empty */
        }
    }
}

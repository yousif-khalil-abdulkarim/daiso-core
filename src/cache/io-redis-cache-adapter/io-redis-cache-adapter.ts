/**
 * @module Cache
 */

import {
    TypeCacheError,
    UnexpectedCacheError,
    type ValueWithTTL,
    type ICacheAdapter,
} from "@/contracts/cache/_module";
import { type ISerializer } from "@/contracts/serializer/_module";
import type Redis from "ioredis";
import { type Result, ReplyError } from "ioredis";
import { RedisSerializer } from "@/cache/_shared/redis-serializer";

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_put(
            key: string,
            value: string,
            ttl: string,
        ): Result<number, Context>;
        daiso_increment(key: string, number: string): Result<number, Context>;
        daiso_clear(prefix: string): Result<number, Context>;
    }
}

/**
 * @group Adapters
 */
export type IoRedisCacheAdapterSettings = {
    serializer?: ISerializer<string>;
};
/**
 * @group Adapters
 */
export class IoRedisCacheAdapter<TType> implements ICacheAdapter<TType> {
    private serializer: ISerializer<string>;

    constructor(
        private readonly client: Redis,
        {
            serializer = new RedisSerializer(),
        }: IoRedisCacheAdapterSettings = {},
    ) {
        this.serializer = serializer;
        this.initPutCommand();
        this.initIncrementCommand();
        this.initClearCommand();
    }

    private initPutCommand(): void {
        if (typeof this.client.daiso_put === "function") {
            return;
        }

        this.client.defineCommand("daiso_put", {
            numberOfKeys: 1,
            lua: `
            local hasKey = redis.call("exists", KEYS[1])
            
            if tonumber(ARGV[2]) == -1 then
                redis.call("set", KEYS[1], ARGV[1])
            else 
                redis.call("set", KEYS[1], ARGV[1], "PX", tonumber(ARGV[2]))
            end

            return hasKey
            `,
        });
    }

    private initIncrementCommand(): void {
        if (typeof this.client.daiso_increment === "function") {
            return;
        }

        this.client.defineCommand("daiso_increment", {
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

    private initClearCommand(): void {
        if (typeof this.client.daiso_clear === "function") {
            return;
        }

        this.client.defineCommand("daiso_clear", {
            numberOfKeys: 0,
            lua: `
            local keys = redis.call("keys", tostring(ARGV[1]).."*")
    
            for i = 1, #keys, 1  do 
                redis.call("del", keys[i]) 
            end
            `,
        });
    }

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        let pipeline = this.client.pipeline();
        for (const key of keys) {
            pipeline = pipeline.exists(key);
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedCacheError("!!__message__!!!");
        }

        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedCacheError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "number") {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const hasKey = redisResult === 1;
            results[key] = hasKey;
        }

        return results;
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        let pipeline = this.client.pipeline();
        for (const key of keys) {
            pipeline = pipeline.get(key);
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedCacheError("!!__message__!!");
        }

        const results = {} as Record<TKeys, TValues | null>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedCacheError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "string" && redisResult !== null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            if (redisResult !== null) {
                results[key] =
                    await this.serializer.deserialize<TValues>(redisResult);
            } else {
                results[key] = null;
            }
        }

        return results;
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        let pipeline = this.client.pipeline();
        for (const key in values) {
            const {
                [key]: { value, ttlInMs },
            } = values;
            if (ttlInMs !== null) {
                pipeline = pipeline.set(
                    key,
                    await this.serializer.serialize(value),
                    "PX",
                    ttlInMs,
                    "NX",
                );
            } else {
                pipeline = pipeline.set(
                    key,
                    await this.serializer.serialize(value),
                    "NX",
                );
            }
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedCacheError("!!__message__!!");
        }

        const keys = Object.keys(values) as TKeys[];
        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedCacheError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "string" && redisResult !== null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            results[key] = redisResult === "OK";
        }

        return results;
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        let pipeline = this.client.pipeline();
        for (const key in values) {
            const {
                [key]: { value, ttlInMs },
            } = values;
            pipeline = pipeline.daiso_put(
                key,
                await this.serializer.serialize(value),
                String(ttlInMs ? ttlInMs : -1),
            );
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedCacheError("!!__message__!!");
        }

        const keys = Object.keys(values) as TKeys[];
        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedCacheError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "number") {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const hasAdded = redisResult === 1;
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            results[key] = hasAdded;
        }

        return results;
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        let pipline = this.client.pipeline();
        for (const key of keys) {
            pipline = pipline.del(key);
        }
        const redisResults = await pipline.exec();
        if (redisResults === null) {
            throw new UnexpectedCacheError("!!__message__!!!");
        }

        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedCacheError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "number") {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const hasRemoved = redisResult === 1;
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            results[key] = hasRemoved;
        }
        return results;
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        const redisResult = await this.client.getdel(key);
        if (redisResult === null) {
            return null;
        }
        return await this.serializer.deserialize<TValue>(redisResult);
    }

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: TExtended,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended> {
        let redisResult: string | null;
        const serializedValueToAdd =
            await this.serializer.serialize(valueToAdd);
        if (ttlInMs !== null) {
            redisResult = await this.client.set(
                key,
                serializedValueToAdd,
                "PX",
                ttlInMs,
                "NX",
                "GET",
            );
        } else {
            redisResult = await this.client.set(
                key,
                serializedValueToAdd,
                "NX",
                "GET",
            );
        }
        if (redisResult === null) {
            return valueToAdd;
        }
        return await this.serializer.deserialize(redisResult);
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const redisResult = await this.client.daiso_increment(
                key,
                await this.serializer.serialize(value as TType),
            );
            const keyExists = redisResult === 1;
            return keyExists;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const isTypeError: boolean =
                error instanceof ReplyError &&
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                error.message.startsWith(
                    "ERR value is not a valid float script:",
                );
            if (isTypeError) {
                throw new TypeCacheError("!!__message__!!");
            }
            throw error;
        }
    }

    async clear(prefix: string): Promise<void> {
        await this.client.daiso_clear(prefix);
    }
}

import { type RecordItem } from "@/_shared/types";
import {
    CacheError,
    TypeCacheError,
    UnexpectedCacheError,
    type InserItem,
} from "@/contracts/cache/_shared";
import { type ICacheAdapter } from "@/contracts/cache/cache-adapter.contract";
import { type ISerializer } from "@/contracts/serializer/serializer.contract";
import type Redis from "ioredis";
import { type Result, ReplyError } from "ioredis";

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_tech_updateIncrement(
            key: string,
            value: number,
        ): Result<number, Context>;
        daiso_tech_upsertIncrement(
            key: string,
            value: number,
            ttlInMs: number,
        ): Result<number, Context>;
        daiso_tech_upsert(
            key: string,
            value: unknown,
            ttlInMs: number,
        ): Result<number, Context>;
        daiso_tech_clear(pattern: string): Result<void, Context>;
    }
}

export type IoRedisCacheAdapterSettings = {
    namespace: string;
    serializer: ISerializer<string | Buffer | number>;
};
export class IoRedisCacheAdapter<TType> implements ICacheAdapter<TType> {
    constructor(
        private readonly client: Redis,
        private readonly settings: IoRedisCacheAdapterSettings,
    ) {
        this.initIncrementScript();
        this.initUpsertIncrementScript();
        this.initUpsertScript();
        this.initClearScript();
    }

    private initIncrementScript(): void {
        if (typeof this.client.daiso_tech_updateIncrement === "undefined") {
            this.client.defineCommand("daiso_tech_updateIncrement", {
                numberOfKeys: 1,
                lua: `if redis.call("exists", KEYS[1]) == 1 then
                        redis.call("incrbyfloat", KEYS[1], ARGV[1])
                        return 1
                    else
                        return 0
                    end`,
            });
        }
    }

    private initUpsertIncrementScript(): void {
        if (typeof this.client.daiso_tech_upsertIncrement === "undefined") {
            this.client.defineCommand("daiso_tech_upsertIncrement", {
                numberOfKeys: 1,
                lua: `
                    local hasKey = redis.call("exists", KEYS[1])
                    redis.call("incrbyfloat", KEYS[1], ARGV[1])
                    if hasKey == 1 then
                        return 0
                    else
                        if tonumber(ARGV[2]) >= 0 then
                            redis.call("pexpire", KEYS[1], tonumber(ARGV[2]), "nx")
                        end
                        return 1
                    end`,
            });
        }
    }

    private initUpsertScript(): void {
        if (typeof this.client.daiso_tech_upsert === "undefined") {
            this.client.defineCommand("daiso_tech_upsert", {
                numberOfKeys: 1,
                lua: `
                    local hasKey = redis.call("exists", KEYS[1])
                    redis.call("set", KEYS[1], ARGV[1])
                    if hasKey == 1 then
                        return 0
                    else
                        if tonumber(ARGV[2]) >= 0 then
                            redis.call("pexpire", KEYS[1], tonumber(ARGV[2]), "nx")
                        end
                        return 1
                    end`,
            });
        }
    }

    private initClearScript(): void {
        if (typeof this.client.daiso_tech_clear === "undefined") {
            this.client.defineCommand("daiso_tech_clear", {
                numberOfKeys: 0,
                lua: `
                    local keys = redis.call("keys", ARGV[1])
                    for i = 1, #keys, 1 do 
                        redis.call("del", keys[i]) 
                    end`,
            });
        }
    }

    private withNamespace(value: string): string {
        return `${this.settings.namespace}${value}`;
    }

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        try {
            let pipeline = this.client.pipeline();
            for (const key of keys) {
                pipeline = pipeline.exists(this.withNamespace(key));
            }
            const redisResult = await pipeline.exec();
            if (redisResult === null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const results = Object.fromEntries(
                keys.map<RecordItem<TKeys, boolean>>((key) => [key, false]),
            );
            for (const [index, [error, result]] of redisResult.entries()) {
                if (error !== null) {
                    throw error;
                }
                const key = keys[index];
                if (key === undefined) {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                if (typeof result !== "number") {
                    throw new UnexpectedCacheError("!!_message__!!");
                }
                const hasKey = result === 1;
                results[key] = hasKey;
            }
            return results as Record<TKeys, boolean>;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        try {
            let pipeline = this.client.pipeline();
            for (const key of keys) {
                pipeline = pipeline.get(this.withNamespace(key));
            }
            const redisResults = await pipeline.exec();
            if (redisResults === null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const results = Object.fromEntries(
                keys.map<RecordItem<TKeys, TValues | null>>((key) => [
                    key,
                    null,
                ]),
            );

            for (const [
                index,
                [error, redisResult],
            ] of redisResults.entries()) {
                if (error !== null) {
                    throw error;
                }
                const key = keys[index];
                if (key === undefined) {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                if (redisResult === null) {
                    continue;
                } else if (typeof redisResult === "string") {
                    results[key] =
                        await this.settings.serializer.deserialize(redisResult);
                } else {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
            }
            return results as Record<TKeys, TValues | null>;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async insertMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<InserItem<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            let pipeline = this.client.pipeline();
            for (const key in values) {
                const { value, ttlInMs } = values[key];
                const serializedValue =
                    await this.settings.serializer.serialize(value);
                const namepsaceKey = this.withNamespace(key);
                if (ttlInMs !== null) {
                    pipeline = pipeline.set(
                        namepsaceKey,
                        serializedValue,
                        "PX",
                        ttlInMs,
                        "NX",
                    );
                } else {
                    pipeline = pipeline.set(
                        namepsaceKey,
                        serializedValue,
                        "NX",
                    );
                }
            }
            const redisResult = await pipeline.exec();
            if (redisResult === null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const keys = Object.keys(values) as TKeys[];
            const results = Object.fromEntries(
                keys.map<RecordItem<TKeys, boolean>>((key) => [key, false]),
            );
            for (const [index, [error, value]] of redisResult.entries()) {
                const key = keys[index];
                if (key === undefined) {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                if (error !== null) {
                    throw error;
                }
                results[key] = value === "OK";
            }
            return results as Record<TKeys, boolean>;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async upsertMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<InserItem<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            let pipeline = this.client.pipeline();
            for (const key in values) {
                const { value, ttlInMs } = values[key];
                pipeline = pipeline.daiso_tech_upsert(
                    this.withNamespace(key),
                    value,
                    ttlInMs === null ? -1 : 0,
                );
            }
            const redisResult = await pipeline.exec();
            if (redisResult === null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const keys = Object.keys(values);
            const result = Object.fromEntries(
                keys.map<RecordItem<TKeys, boolean>>((key) => [
                    key as TKeys,
                    false,
                ]),
            );
            for (const [index, [error, value]] of redisResult.entries()) {
                if (error !== null) {
                    throw error;
                }
                const key = keys[index];
                if (key === undefined) {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                if (typeof value !== "number") {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                const hasInserted = value === 1;
                result[key] = hasInserted;
            }
            return result as Record<TKeys, boolean>;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            let pipeline = this.client.pipeline();
            for (const key in values) {
                const value = values[key];
                const serializedValue =
                    await this.settings.serializer.serialize(value);
                const namepsaceKey = this.withNamespace(key);
                pipeline = pipeline.set(
                    namepsaceKey,
                    serializedValue,
                    "KEEPTTL",
                    "XX",
                );
            }
            const redisResult = await pipeline.exec();
            if (redisResult === null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const keys = Object.keys(values) as TKeys[];
            const results = Object.fromEntries(
                keys.map<RecordItem<TKeys, boolean>>((key) => [key, false]),
            );
            for (const [index, [error, value]] of redisResult.entries()) {
                const key = keys[index];
                if (key === undefined) {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                if (error !== null) {
                    throw error;
                }
                results[key] = value === "OK";
            }
            return results as Record<TKeys, boolean>;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        try {
            let pipeline = this.client.pipeline();
            for (const key of keys) {
                pipeline = pipeline.del(this.withNamespace(key));
            }
            const redisResult = await pipeline.exec();
            if (redisResult === null) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            const results = Object.fromEntries(
                keys.map<RecordItem<TKeys, boolean>>((key) => [key, false]),
            );
            for (const [index, [error, result]] of redisResult.entries()) {
                if (error !== null) {
                    throw new Error();
                }
                if (typeof result !== "number") {
                    throw new UnexpectedCacheError("!!_message__!!");
                }
                const hasDeleted = result === 1;
                const key = keys[index];
                if (key === undefined) {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                results[key] = hasDeleted;
            }
            return results as Record<TKeys, boolean>;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        try {
            const result = await this.client.getdel(this.withNamespace(key));
            if (result !== null) {
                return await this.settings.serializer.deserialize(result);
            }
            return null;
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async getOrInsert<TValue extends TType, TExtended extends TType = TValue>(
        key: string,
        insertValue: TExtended,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended> {
        try {
            let redisResult: string | null;

            if (ttlInMs !== null) {
                redisResult = await this.client.set(
                    this.withNamespace(key),
                    await this.settings.serializer.serialize(insertValue),
                    "PX",
                    ttlInMs,
                    "GET",
                );
            } else {
                redisResult = await this.client.set(
                    this.withNamespace(key),
                    await this.settings.serializer.serialize(insertValue),
                    "GET",
                );
            }
            if (redisResult === null) {
                return insertValue;
            }
            return await this.settings.serializer.deserialize(redisResult);
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async updateIncrement(key: string, value: number): Promise<boolean> {
        try {
            const redisResult = await this.client.daiso_tech_updateIncrement(
                this.withNamespace(key),
                value,
            );
            if (redisResult === 1) {
                return true;
            }
            if (redisResult === 0) {
                return false;
            }
            throw new UnexpectedCacheError("!!__message__!!");
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            const isRedisTypeError =
                error instanceof ReplyError &&
                error instanceof Error &&
                error.message.startsWith(
                    "ERR value is not a valid float script:",
                );
            if (isRedisTypeError) {
                throw new TypeCacheError(
                    `Unable to increment or decrement "key" because it is not a numeric type`,
                );
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async upsertIncrement(
        key: string,
        value: number,
        ttlInMs: number | null,
    ): Promise<boolean> {
        try {
            const redisResult = await this.client.daiso_tech_upsertIncrement(
                this.withNamespace(key),
                value,
                ttlInMs === null ? -1 : ttlInMs,
            );
            if (redisResult === 1) {
                return true;
            }
            if (redisResult === 0) {
                return false;
            }
            throw new UnexpectedCacheError("!!__message__!!");
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            const isRedisTypeError =
                error instanceof ReplyError &&
                error instanceof Error &&
                error.message.startsWith(
                    "ERR value is not a valid float script:",
                );
            if (isRedisTypeError) {
                throw new TypeCacheError(
                    `Unable to increment or decrement "key" because it is not a numeric type`,
                );
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async clear(): Promise<void> {
        try {
            await this.client.daiso_tech_clear(this.withNamespace("*"));
        } catch (error: unknown) {
            if (error instanceof CacheError) {
                throw error;
            }
            throw new UnexpectedCacheError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

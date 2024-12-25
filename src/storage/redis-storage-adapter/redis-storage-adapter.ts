/**
 * @module Storage
 */

import { RedisSerializer, SuperJsonSerializer } from "@/serializer/_module";
import { type ISerializer } from "@/contracts/serializer/_module";
import { type IStorageAdapter } from "@/contracts/storage/_module";
import type Redis from "ioredis";
import { type Result } from "ioredis";
import {
    TypeStorageError,
    UnexpectedStorageError,
} from "@/contracts/storage/_module";
import { ClearIterable, escapeRedisChars } from "@/_shared/redis/_module";
import { isRedisTypeError } from "@/_shared/redis/_module";

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_storage_increment(
            key: string,
            number: string,
        ): Result<number, Context>;
        daiso_storage_put(key: string, value: string): Result<string, Context>;
        daiso_storage_getOrAdd(
            key: string,
            valueToAdd: string,
        ): Result<string, Context>;
    }
}

/**
 * @group Adapters
 */
export type RedisStorageAdapterSettings = {
    serializer?: ISerializer<string>;
};
/**
 * @group Adapters
 */
export class RedisStorageAdapter<TType> implements IStorageAdapter<TType> {
    private serializer: ISerializer<string>;

    constructor(
        private readonly client: Redis,
        {
            serializer = new SuperJsonSerializer(),
        }: RedisStorageAdapterSettings = {},
    ) {
        this.serializer = new RedisSerializer(serializer);
        this.initIncrementCommand();
        this.initPutCommand();
    }

    private initIncrementCommand(): void {
        if (typeof this.client.daiso_storage_increment === "function") {
            return;
        }

        this.client.defineCommand("daiso_storage_increment", {
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

    private initPutCommand(): void {
        if (typeof this.client.daiso_storage_put === "function") {
            return;
        }

        this.client.defineCommand("daiso_storage_put", {
            numberOfKeys: 1,
            lua: `
            local hasKey = redis.call("exists", KEYS[1])
            redis.call("set", KEYS[1], ARGV[1])
            return hasKey
            `,
        });
    }

    async existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        let pipeline = this.client.pipeline();
        for (const key of keys) {
            pipeline = pipeline.exists(key);
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedStorageError("Redis result is missing");
        }

        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedStorageError(
                    `Unexpected redis error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "number") {
                throw new UnexpectedStorageError(
                    "Redis result is not a number",
                );
            }
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedStorageError("Array item is undefined");
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
            throw new UnexpectedStorageError("Redis result is missing");
        }

        const results = {} as Record<TKeys, TValues | null>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedStorageError(
                    `Unexpected redis error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "string" && redisResult !== null) {
                throw new UnexpectedStorageError(
                    "Redis result is invalid type expected to be null or string",
                );
            }
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedStorageError("Array item is undefined");
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
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        let pipeline = this.client.pipeline();
        for (const key in values) {
            const { [key]: value } = values;
            pipeline = pipeline.set(
                key,
                await this.serializer.serialize(value),
                "NX",
            );
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedStorageError("Redis result is missing");
        }

        const keys = Object.keys(values) as TKeys[];
        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedStorageError(
                    `Unexpected redis error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "string" && redisResult !== null) {
                throw new UnexpectedStorageError(
                    "Redis result is invalid type expected to be null or string",
                );
            }
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedStorageError("Array item is undefined");
            }
            results[key] = redisResult === "OK";
        }

        return results;
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        let pipeline = this.client.pipeline();
        for (const key in values) {
            const { [key]: value } = values;
            pipeline = pipeline.set(
                key,
                await this.serializer.serialize(value),
                "XX",
            );
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedStorageError("Redis result is missing");
        }

        const keys = Object.keys(values) as TKeys[];
        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedStorageError(
                    `Unexpected redis error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "string" && redisResult !== null) {
                throw new UnexpectedStorageError(
                    "Redis result is invalid type expected to be null or string",
                );
            }
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedStorageError("Array item is undefined");
            }
            results[key] = redisResult === "OK";
        }

        return results;
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        let pipeline = this.client.pipeline();
        for (const key in values) {
            const { [key]: value } = values;
            pipeline = pipeline.daiso_storage_put(
                key,
                await this.serializer.serialize(value),
            );
        }
        const redisResults = await pipeline.exec();
        if (redisResults === null) {
            throw new UnexpectedStorageError("Redis result is missing");
        }

        const keys = Object.keys(values) as TKeys[];
        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedStorageError(
                    `Unexpected redis error "${String(error)}" occured`,
                    error,
                );
            }
            const hasAdded = redisResult === 1;
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedStorageError("Array item is undefined");
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
            throw new UnexpectedStorageError("Redis result is missing");
        }

        const results = {} as Record<TKeys, boolean>;
        for (const [index, [error, redisResult]] of redisResults.entries()) {
            if (error !== null) {
                throw new UnexpectedStorageError(
                    `Unexpected redis error "${String(error)}" occured`,
                    error,
                );
            }
            if (typeof redisResult !== "number") {
                throw new UnexpectedStorageError(
                    "Redis result is not a number",
                );
            }
            const hasRemoved = redisResult === 1;
            const key = keys[index];
            if (key === undefined) {
                throw new UnexpectedStorageError("Array item is undefined");
            }
            results[key] = hasRemoved;
        }
        return results;
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const redisResult = await this.client.daiso_storage_increment(
                key,
                await this.serializer.serialize(value as TType),
            );
            const keyExists = redisResult === 1;
            return keyExists;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: unknown) {
            if (!isRedisTypeError(error)) {
                throw error;
            }
            throw new TypeStorageError(
                `Unable to increment or decrement none number type key "${key}"`,
            );
        }
    }

    async clear(prefix: string): Promise<void> {
        for await (const _ of new ClearIterable(
            this.client,
            `${escapeRedisChars(prefix)}*`,
        )) {
            /* Empty */
        }
    }
}

/**
 * @module Storage
 */

import {
    RedisSerializer,
    SuperJsonSerializer,
} from "@/serializer/implementations/_module";
import { type ISerializer } from "@/serializer/contracts/_module";
import { type IStorageAdapter } from "@/storage/contracts/_module";
import type Redis from "ioredis";
import { type Result } from "ioredis";
import { TypeStorageError } from "@/storage/contracts/_module";
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

    async get(key: string): Promise<TType | null> {
        const value = await this.client.get(key);
        if (value === null) {
            return null;
        }
        return await this.serializer.deserialize(value);
    }

    async add(key: string, value: TType): Promise<boolean> {
        const result = await this.client.set(
            key,
            await this.serializer.serialize(value),
            "NX",
        );
        return result === "OK";
    }

    async update(key: string, value: TType): Promise<boolean> {
        const result = await this.client.set(
            key,
            await this.serializer.serialize(value),
            "XX",
        );
        return result === "OK";
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

    async put(key: string, value: TType): Promise<boolean> {
        const result = await this.client.daiso_storage_put(
            key,
            await this.serializer.serialize(value),
        );
        return Number(result) === 1;
    }

    async remove(key: string): Promise<boolean> {
        const result = await this.client.del(key);
        return result === 1;
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

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const redisResult = await this.client.daiso_storage_increment(
                key,
                await this.serializer.serialize(value),
            );
            const keyExists = redisResult === 1;
            return keyExists;
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

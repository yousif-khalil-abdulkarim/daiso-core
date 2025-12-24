/**
 * @module Cache
 */

import {
    type IDatabaseCacheAdapter,
    type ICacheAdapter,
} from "@/cache/contracts/_module.js";
import type { TimeSpan } from "@/time-span/implementations/_module.js";

/**
 * @internal
 */
export class DatabaseCacheAdapter<TType = unknown>
    implements ICacheAdapter<TType>
{
    constructor(private readonly adapter: IDatabaseCacheAdapter<TType>) {}

    async get(key: string): Promise<TType | null> {
        const data = await this.adapter.find(key);
        if (data === null) {
            return null;
        }
        const { expiration, value } = data;
        if (expiration === null) {
            return value;
        }
        const hasExpired = expiration.getTime() <= new Date().getTime();
        if (hasExpired) {
            await this.adapter.removeExpiredMany([key]);
            return null;
        }
        return value;
    }

    async getAndRemove(key: string): Promise<TType | null> {
        const value = await this.get(key);
        if (value !== null) {
            await this.removeMany([key]);
        }
        return value;
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        try {
            await this.adapter.insert({
                key,
                value,
                expiration: ttl?.toEndDate() ?? null,
            });
            return true;
        } catch {
            const result = await this.adapter.updateExpired({
                expiration: ttl?.toEndDate() ?? null,
                key,
                value,
            });
            return result > 0;
        }
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const data = await this.adapter.upsert({
            key,
            value,
            expiration: ttl?.toEndDate() ?? null,
        });
        if (data === null) {
            return false;
        }
        const { expiration } = data;
        if (expiration === null) {
            return true;
        }
        const hasExpired = expiration.getTime() <= new Date().getTime();
        return !hasExpired;
    }

    async update(key: string, value: TType): Promise<boolean> {
        const result = await this.adapter.updateUnexpired({
            key,
            value,
        });
        return result > 0;
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            const result = await this.adapter.incrementUnexpired({
                key,
                value,
            });
            return result > 0;
        } catch (error: unknown) {
            if (error instanceof TypeError) {
                throw error;
            }
            throw new TypeError(
                `Unable to increment or decrement none number type key "${key}"`,
                { cause: error },
            );
        }
    }

    async removeAll(): Promise<void> {
        await this.adapter.removeAll();
    }

    async removeMany(keys: string[]): Promise<boolean> {
        const [promiseResult] = await Promise.allSettled([
            this.adapter.removeUnexpiredMany(keys),
            this.adapter.removeExpiredMany(keys),
        ]);
        if (promiseResult.status === "rejected") {
            throw promiseResult.reason;
        }
        const { value: result } = promiseResult;
        return result > 0;
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        await this.adapter.removeByKeyPrefix(prefix);
    }
}

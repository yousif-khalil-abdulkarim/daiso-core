/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/contracts/cache/cache-adapter.contract";
import { AsyncLazyable, type RecordItem } from "@/_shared/types";
import {
    CacheError,
    type InserItem,
    TypeCacheError,
    UnexpectedCacheError,
} from "@/contracts/cache/_shared";
import { simplifyAsyncLazyable } from "@/_shared/utilities";

export class UsableCacheAdapter<TType>
    implements Required<ICacheAdapter<TType>>
{
    constructor(private readonly cacheAdapter: ICacheAdapter<TType>) {}

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        try {
            if (this.cacheAdapter.hasMany !== undefined) {
                return await this.cacheAdapter.hasMany(keys);
            }
            const items = await this.getMany(keys);
            const hasItems = Object.fromEntries(
                Object.entries(items).map(([key, value]) => [
                    key,
                    value !== null,
                ]),
            ) as Record<TKeys, boolean>;
            return hasItems;
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
            return await this.cacheAdapter.getMany(keys);
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
            return await this.cacheAdapter.insertMany(values);
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
            if (this.cacheAdapter.upsertMany !== undefined) {
                return await this.cacheAdapter.upsertMany(values);
            }
            const insertResult = await this.cacheAdapter.insertMany(values);
            const updates = Object.fromEntries(
                Object.entries<boolean>(insertResult)
                    .filter(([_key, hasInserted]) => !hasInserted)
                    .map<RecordItem<TKeys, TValues>>(([key]) => {
                        const { value } = values[key as TKeys];
                        return [key as TKeys, value];
                    }),
            ) as Record<TKeys, TValues>;
            await this.cacheAdapter.updateMany(updates);
            return insertResult;
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
            return await this.cacheAdapter.updateMany(values);
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
            return await this.cacheAdapter.removeMany(keys);
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
            if (this.cacheAdapter.getAndRemove !== undefined) {
                return await this.cacheAdapter.getAndRemove(key);
            }
            const { [key]: value } = await this.cacheAdapter.getMany<
                TValue,
                string
            >([key]);
            if (value === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            if (value !== null) {
                await this.cacheAdapter.removeMany([key]);
            }
            return value;
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
        insertValue: AsyncLazyable<TExtended>,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended> {
        try {
            if (
                typeof insertValue !== "function" &&
                this.cacheAdapter.getOrInsert
            ) {
                return await this.cacheAdapter.getOrInsert<TValue, TExtended>(
                    key,
                    insertValue,
                    ttlInMs,
                );
            }
            const { [key]: value } = await this.cacheAdapter.getMany<
                TValue,
                string
            >([key]);
            if (value === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            if (value === null) {
                const simplifiedValue =
                    await simplifyAsyncLazyable(insertValue);
                await this.cacheAdapter.insertMany<TExtended, string>({
                    [key]: {
                        value: simplifiedValue,
                        ttlInMs,
                    },
                });
                return simplifiedValue;
            }
            return value;
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
            if (this.cacheAdapter.updateIncrement !== undefined) {
                return await this.cacheAdapter.updateIncrement(key, value);
            }
            const { [key]: previousValue } = await this.cacheAdapter.getMany([
                key,
            ]);
            if (previousValue === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            if (previousValue === null) {
                return false;
            }
            if (typeof previousValue !== "number") {
                throw new TypeCacheError(
                    `Unable to increment or decrement "key" because it is not a numeric type`,
                );
            }
            await this.cacheAdapter.updateMany({
                [key]: (previousValue + 1) as TType,
            });
            return true;
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

    async upsertIncrement(
        key: string,
        value: number,
        ttlInMs: number | null,
    ): Promise<boolean> {
        if (this.cacheAdapter.upsertIncrement !== undefined) {
            return await this.cacheAdapter.upsertIncrement(key, value, ttlInMs);
        }
        const { [key]: previousValue } = await this.cacheAdapter.getMany<
            TType,
            string
        >([key]);
        if (previousValue === undefined) {
            throw new UnexpectedCacheError(
                `Destructed field "key" does not exist`,
            );
        }
        if (previousValue === null) {
            await this.cacheAdapter.insertMany({
                [key]: {
                    value: value as TType,
                    ttlInMs,
                },
            });
            return true;
        }
        if (typeof previousValue !== "number") {
            throw new TypeCacheError(
                `Unable to increment or decrement "key" because it is not a numeric type`,
            );
        }
        await this.updateMany({
            [key]: (previousValue + value) as TType,
        });
        return false;
    }

    async clear(): Promise<void> {
        try {
            await this.cacheAdapter.clear();
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

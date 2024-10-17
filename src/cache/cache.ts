/**
 * @module Cache
 */

import { type CacheValue, type ICache } from "@/contracts/cache/cache.contract";
import { type ICacheAdapter } from "@/contracts/cache/cache-adapter.contract";
import { type RecordItem, type AsyncLazyable } from "@/_shared/types";
import {
    CacheError,
    type InserItem,
    UnexpectedCacheError,
} from "@/contracts/cache/_shared";
import { simplifyAsyncLazyable } from "@/_shared/utilities";
import { UsableCacheAdapter } from "@/cache/usable-cache-adapter";

/**
 * @group Adapters
 */
export class Cache<TType = unknown> implements ICache<TType> {
    private static readonly DEFAULT_TTL: number | null = null;

    private readonly cacheAdapter: Required<ICacheAdapter<TType>>;

    constructor(cacheAdapter: ICacheAdapter<TType>) {
        this.cacheAdapter = new UsableCacheAdapter(cacheAdapter);
    }

    async has(key: string): Promise<boolean> {
        try {
            const { [key]: hasKey } = await this.cacheAdapter.hasMany([key]);
            if (hasKey === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            return hasKey;
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

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        try {
            return await this.cacheAdapter.hasMany(keys);
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

    async get<TValue extends TType>(key: string): Promise<TValue | null> {
        try {
            const { [key]: value } = await this.cacheAdapter.getMany<
                TValue,
                string
            >([key]);
            if (value === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
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

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        try {
            return await this.cacheAdapter.getMany<TValues, TKeys>(keys);
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

    async getOrMany<TValues extends TType, TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TValues>>,
    ): Promise<Record<TKeys, TValues>> {
        try {
            const keys = Object.keys(keysWithDefaults) as TKeys[];
            const result = await this.cacheAdapter.getMany<TValues, TKeys>(
                keys,
            );
            const resultWithDefaults = Object.fromEntries(
                await Promise.all(
                    Object.entries<TValues | null>(result).map<
                        Promise<RecordItem<TKeys, TValues>>
                    >(async ([key, value]) => {
                        if (value === null) {
                            const defaultValue = keysWithDefaults[key as TKeys];
                            return [
                                key as TKeys,
                                (await simplifyAsyncLazyable(
                                    defaultValue,
                                )) as TValues,
                            ];
                        }
                        return [key as TKeys, value];
                    }),
                ),
            ) as Record<TKeys, TValues>;
            return resultWithDefaults;
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

    async insert<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs: number | null = null,
    ): Promise<boolean> {
        try {
            const { [key]: hasInserted } = await this.cacheAdapter.insertMany({
                [key]: {
                    value,
                    ttlInMs,
                },
            });
            if (hasInserted === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            return hasInserted;
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
        values: Record<TKeys, InserItem<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            const valuesWithDefault = Object.fromEntries(
                Object.entries<InserItem<TValues>>(values).map<
                    RecordItem<TKeys, Required<InserItem<TType>>>
                >(([key, { value, ttlInMs = Cache.DEFAULT_TTL }]) => [
                    key as TKeys,
                    {
                        value,
                        ttlInMs,
                    },
                ]),
            ) as Record<TKeys, Required<InserItem<TValues>>>;

            return await this.cacheAdapter.insertMany(valuesWithDefault);
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

    async upsert<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs: number | null = null,
    ): Promise<boolean> {
        try {
            const { [key]: hasInserted } = await this.cacheAdapter.upsertMany<
                TValue,
                string
            >({
                [key]: {
                    value,
                    ttlInMs,
                },
            });
            if (hasInserted === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            return hasInserted;
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
        values: Record<TKeys, InserItem<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            const valuesWithDefault = Object.fromEntries(
                Object.entries<InserItem<TValues>>(values).map<
                    RecordItem<TKeys, Required<InserItem<TType>>>
                >(([key, { value, ttlInMs = Cache.DEFAULT_TTL }]) => [
                    key as TKeys,
                    {
                        value,
                        ttlInMs,
                    },
                ]),
            ) as Record<TKeys, Required<InserItem<TValues>>>;

            return await this.cacheAdapter.upsertMany(valuesWithDefault);
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

    async update<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
    ): Promise<boolean> {
        try {
            const { [key]: hasUpdated } = await this.cacheAdapter.updateMany({
                [key]: value,
            });
            if (hasUpdated === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            return hasUpdated;
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
        values: Record<TKeys, CacheValue<TValues>>,
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

    async remove(key: string): Promise<boolean> {
        try {
            const { [key]: hasRemoved } = await this.cacheAdapter.removeMany([
                key,
            ]);
            if (hasRemoved === undefined) {
                throw new UnexpectedCacheError(
                    `Destructed field "key" does not exist`,
                );
            }
            return hasRemoved;
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

    async getOr<TValue extends TType, TExtended extends TType = TValue>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended> {
        try {
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
                return await simplifyAsyncLazyable(defaultValue);
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

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        try {
            return await this.cacheAdapter.getAndRemove(key);
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

    async getAndRemoveOr<
        TValue extends TType,
        TExtended extends TType = TValue,
    >(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended> {
        try {
            const value = await this.cacheAdapter.getAndRemove<TValue>(key);
            if (value === null) {
                return await simplifyAsyncLazyable(defaultValue);
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
        insertValue: AsyncLazyable<CacheValue<TExtended>>,
        ttlInMs: number | null = null,
    ): Promise<TValue | TExtended> {
        try {
            if (typeof insertValue !== "function") {
                return await this.cacheAdapter.getOrInsert<TValue, TExtended>(
                    key,
                    insertValue,
                    ttlInMs,
                );
            }
            return await this.cacheAdapter.getOrInsert<TValue, TExtended>(
                key,
                await simplifyAsyncLazyable(insertValue),
                ttlInMs,
            );
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
            return await this.cacheAdapter.updateIncrement(key, value);
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
        ttlInMs: number | null = null,
    ): Promise<boolean> {
        try {
            return await this.cacheAdapter.upsertIncrement(key, value, ttlInMs);
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

    async updateDecrement(key: string, value: number): Promise<boolean> {
        try {
            return await this.cacheAdapter.updateIncrement(key, -value);
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

    async upsertDecrement(
        key: string,
        value: number,
        ttlInMs: number | null = null,
    ): Promise<boolean> {
        try {
            return await this.cacheAdapter.upsertIncrement(
                key,
                -value,
                ttlInMs,
            );
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

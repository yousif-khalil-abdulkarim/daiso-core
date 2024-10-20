import { AsyncLazyable } from "@/_shared/types";
import {
    CacheError,
    InvalidValueCacheError,
    UnexpectedCacheError,
    ValueWithTTL,
} from "@/contracts/cache/_shared";
import { ICacheAdapter } from "@/contracts/cache/cache-adapter.contract";
import { CacheValue, ICache } from "@/contracts/cache/cache.contract";
import { UsableCacheAdapter } from "@/cache/usable-cache-adapter";
import { NamespaceCacheAdapter } from "@/cache/namespace-cache-adapter";
import { simplifyAsyncLazyable } from "@/_shared/utilities";

export type CacheSettings = {
    namespace?: string;
};
export class Cache<TType> implements ICache<TType> {
    private readonly cacheAdapter: NamespaceCacheAdapter<TType>;

    private readonly namespace: string;

    constructor(
        cacheAdapter: ICacheAdapter<TType>,
        { namespace = "" }: CacheSettings = {},
    ) {
        this.cacheAdapter = new NamespaceCacheAdapter<TType>(
            new UsableCacheAdapter(cacheAdapter),
            namespace,
        );
        this.namespace = namespace;
    }

    private abra<TValue>(
        values: Record<string, ValueWithTTL<CacheValue<TValue>>>,
    ): Record<string, Required<ValueWithTTL<CacheValue<TValue>>>> {
        return Object.fromEntries(
            Object.entries(values).map(([key, { value, ttlInMs = null }]) => [
                key,
                { value, ttlInMs },
            ]),
        );
    }

    async has(key: string): Promise<boolean> {
        try {
            const { [key]: hasKey } = await this.cacheAdapter.hasMany([key]);
            if (hasKey === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
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
                throw new UnexpectedCacheError("!!__message__!!");
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

    async getOr<TValue extends TType, TExtended extends TType>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended> {
        try {
            const value = await this.get<TValue>(key);
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

    async getOrMany<
        TValues extends TType,
        TExtended extends TType,
        TKeys extends string,
    >(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TExtended>>,
    ): Promise<Record<TKeys, TValues | TExtended>> {
        try {
            const getManyResult = await this.getMany(
                Object.keys(keysWithDefaults),
            );
            const result = {} as Record<string, TValues | TExtended>;
            for (const key in getManyResult) {
                const { [key]: value } = getManyResult;
                if (value === undefined) {
                    throw new UnexpectedCacheError("!!__message__!!");
                }
                if (value === null) {
                    const defaultValue = keysWithDefaults[key as TKeys];
                    result[key] = (await simplifyAsyncLazyable(
                        defaultValue,
                    )) as TExtended;
                } else {
                    result[key] = value as TValues;
                }
            }
            return result;
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

    async add<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs: number | null = null,
    ): Promise<boolean> {
        try {
            if (Number.isNaN(value)) {
                throw new InvalidValueCacheError("!!__message__!!");
            }
            const { [key]: hasAdded } = await this.cacheAdapter.addMany<
                TValue,
                string
            >({
                [key]: {
                    value,
                    ttlInMs,
                },
            });
            if (hasAdded === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            return hasAdded;
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

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, ValueWithTTL<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            for (const key in values) {
                const {
                    [key]: { value },
                } = values;
                if (Number.isNaN(value)) {
                    throw new InvalidValueCacheError("!!__message__!!");
                }
            }
            return await this.cacheAdapter.addMany(this.abra(values));
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

    async put<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs: number | null = null,
    ): Promise<boolean> {
        try {
            if (Number.isNaN(value)) {
                throw new InvalidValueCacheError("!!__message__!!");
            }
            const { [key]: hasAdded } = await this.cacheAdapter.putMany<
                TValue,
                string
            >({
                [key]: {
                    value,
                    ttlInMs,
                },
            });
            if (hasAdded === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            return hasAdded;
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

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, ValueWithTTL<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            for (const key in values) {
                const {
                    [key]: { value },
                } = values;
                if (Number.isNaN(value)) {
                    throw new InvalidValueCacheError("!!__message__!!");
                }
            }
            return await this.cacheAdapter.putMany(this.abra(values));
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
            const { [key]: hasAdded } = await this.cacheAdapter.removeMany([
                key,
            ]);
            if (hasAdded === undefined) {
                throw new UnexpectedCacheError("!!__message__!!");
            }
            return hasAdded;
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

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<CacheValue<TExtended>>,
        ttlInMs: number | null = null,
    ): Promise<TValue | TExtended> {
        try {
            if (typeof valueToAdd !== "function") {
                if (Number.isNaN(valueToAdd)) {
                    throw new InvalidValueCacheError("!!__message__!!");
                }
                return await this.cacheAdapter.getOrAdd(
                    key,
                    valueToAdd,
                    ttlInMs,
                );
            }
            const value = await this.get(key);
            if (value === null) {
                const simpleValueToAdd =
                    await simplifyAsyncLazyable(valueToAdd);
                if (Number.isNaN(simpleValueToAdd)) {
                    throw new InvalidValueCacheError("!!__message__!!");
                }
                await this.add(key, simpleValueToAdd, ttlInMs);
                return simpleValueToAdd;
            }
            return value as TValue;
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

    async increment(key: string, value: number): Promise<boolean> {
        try {
            if (Number.isNaN(value)) {
                throw new InvalidValueCacheError("!!__message__!!");
            }
            return await this.cacheAdapter.increment(key, value);
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

    async decrement(key: string, value: number): Promise<boolean> {
        try {
            if (Number.isNaN(value)) {
                throw new InvalidValueCacheError("!!__message__!!");
            }
            return await this.cacheAdapter.increment(key, -value);
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

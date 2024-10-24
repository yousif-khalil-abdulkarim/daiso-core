/**
 * @module Cache
 */

import {
    TypeCacheError,
    UnexpectedCacheError,
    type ValueWithTTL,
    type ICacheAdapter,
} from "@/contracts/cache/_module";

/**
 * @internal
 */
export class UsableCacheAdapter<TType>
    implements Required<ICacheAdapter<TType>>
{
    constructor(private readonly cacheAdapter: ICacheAdapter<TType>) {}

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        if (this.cacheAdapter.hasMany) {
            return await this.cacheAdapter.hasMany(keys);
        }
        const values = await this.cacheAdapter.getMany(keys);
        return Object.fromEntries(
            Object.entries(values).map(([key, value]) => {
                return [key, value !== null];
            }),
        ) as Record<TKeys, boolean>;
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        return this.cacheAdapter.getMany(keys);
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.cacheAdapter.addMany(values);
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        if (this.cacheAdapter.putMany) {
            return await this.cacheAdapter.putMany(values);
        }
        const result = await this.cacheAdapter.removeMany(Object.keys(values));
        await this.cacheAdapter.addMany(values);
        return result;
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return await this.cacheAdapter.removeMany(keys);
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        if (this.cacheAdapter.getAndRemove) {
            return await this.cacheAdapter.getAndRemove(key);
        }
        const { [key]: value } = await this.cacheAdapter.getMany<
            TValue,
            string
        >([key]);
        if (value === undefined) {
            throw new UnexpectedCacheError("!!__message__!!");
        }
        await this.cacheAdapter.removeMany([key]);
        return value;
    }

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: TExtended,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended> {
        if (this.cacheAdapter.getOrAdd) {
            return await this.cacheAdapter.getOrAdd(key, valueToAdd, ttlInMs);
        }
        const { [key]: value } = await this.cacheAdapter.getMany<
            TValue,
            string
        >([key]);
        if (value === undefined) {
            throw new UnexpectedCacheError("!!__message__!!");
        }
        if (value === null) {
            await this.cacheAdapter.addMany({
                [key]: {
                    value: valueToAdd,
                    ttlInMs,
                },
            });
            return valueToAdd;
        }
        return value;
    }

    async increment(key: string, value: number): Promise<boolean> {
        if (this.cacheAdapter.increment) {
            return await this.cacheAdapter.increment(key, value);
        }
        const { [key]: previousValue } = await this.cacheAdapter.getMany([key]);
        if (previousValue === undefined) {
            throw new UnexpectedCacheError("!!__message__!!");
        }
        if (previousValue === null) {
            return false;
        }
        if (typeof previousValue !== "number") {
            throw new TypeCacheError("!!__message__!!");
        }
        await this.cacheAdapter.removeMany([key]);
        const newValue = previousValue + value;
        await this.cacheAdapter.addMany({
            [key]: {
                value: newValue as TType,
                ttlInMs: null,
            },
        });
        return true;
    }

    async clear(prefix: string): Promise<void> {
        await this.cacheAdapter.clear(prefix);
    }
}

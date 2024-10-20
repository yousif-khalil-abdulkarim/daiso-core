/**
 * @module Cache
 */

import {
    type ValueWithTTL,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type CacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCacheError,
} from "@/contracts/cache/_shared";

/**
 * @throws {CacheError} {@link CacheError}
 * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
 * @throws {TypeCacheError} {@link TypeCacheError}
 * @group Contracts
 */
export type ICacheAdapter<TType> = {
    /**
     * Returns true for the keys that are found otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    hasMany?<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Returns the value for the keys that are found otherwise null will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>>;

    /**
     * Adds the keys that doesn't exists. Returns true for the keys that doesn't exists otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Replaces the keys that are found. Adds keys that are not found. Returns true for all the keys that are found otherwise false is returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    putMany?<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Removes the keys that are found. Returns true for the keys that are found otherwise false is returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * If the key is found the value be returned and key will be removed otherwise null will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getAndRemove?<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * If the key is found the value be returned otherwise valueToAdd will be added and returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOrAdd?<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: TExtended,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended>;

    /**
     * Will increment the existing key with value if found otherwise key will be set to 0. Returns true if key exists otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment?(key: string, value: number): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    clear(namespace: string): Promise<void>;
};

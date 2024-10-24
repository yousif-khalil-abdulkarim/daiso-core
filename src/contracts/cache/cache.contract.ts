/**
 * @module Cache
 */

import { type AnyFunction, type AsyncLazyable } from "@/_shared/types";
import {
    type ValueWithTTL,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type CacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCacheError,
} from "@/contracts/cache/_shared";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CacheValue<T> = Exclude<T, AnyFunction | undefined | null>;

export type GetOrAddValue<TValue> = Awaited<
    TValue extends AnyFunction ? ReturnType<TValue> : TValue
>;
/**
 * @throws {CacheError} {@link CacheError}
 * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
 * @throws {TypeCacheError} {@link TypeCacheError}
 * @group Contracts
 */
export type ICache<TType = unknown> = {
    /**
     * Returns true when key is found otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    has(key: string): Promise<boolean>;

    /**
     * Returns true for the keys that are found otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Returns the value when key is found otherwise null will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    get<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * Returns the value for the keys that are found otherwise null will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>>;

    /**
     * Returns the value when key is found otherwise defaultValue will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOr<TValue extends TType, TExtended extends TType>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended>;

    /**
     * Returns the value for the keys that are found otherwise defaultValue will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOrMany<
        TValues extends TType,
        TExtended extends TType,
        TKeys extends string,
    >(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TExtended>>,
    ): Promise<Record<TKeys, TValues | TExtended>>;

    /**
     * Adds a key when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}

     */
    add<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs?: number | null,
    ): Promise<boolean>;

    /**
     * Adds the keys that doesn't exists. Returns true for the keys that doesn't exists otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}

     */
    addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, ValueWithTTL<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * If the key is found it will replaced. If the key is not found it will just be added. True is returned if the key is found otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}

     */
    put<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs?: number | null,
    ): Promise<boolean>;

    /**
     * Replaces the keys that are found. Adds keys that are not found. Returns true for all the keys that are found otherwise false is returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}

     */
    putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, ValueWithTTL<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Removes the key when found. Returns true if the key is found otherwise false is returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    remove(key: string): Promise<boolean>;

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
    getAndRemove<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * If the key is found the value be returned otherwise valueToAdd will be added and returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}

     */
    getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<CacheValue<GetOrAddValue<TExtended>>>,
        ttlInMs?: number | null,
    ): Promise<TValue | TExtended>;

    /**
     * Will increment the existing key with value if found otherwise nonthing will occur. Returns true if key exists otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}

     */
    increment(key: string, value: number): Promise<boolean>;

    /**
     * Will decrement the existing key with value if found otherwise nonthing will occur. Returns true if key exists otherwise false will be returned.
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}

     */
    decrement(key: string, value: number): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    clear(): Promise<void>;
};

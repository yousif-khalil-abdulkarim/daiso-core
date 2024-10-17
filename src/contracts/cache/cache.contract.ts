/**
 * @module Cache
 */

import { type AnyFunction, type AsyncLazyable } from "@/_shared/types";
import {
    type InserItem,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type CacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCacheError,
} from "@/contracts/cache/_shared";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CacheValue<T> = Exclude<T, AnyFunction | undefined | null>;

/**
 * @throws {CacheError} {@link CacheError}
 * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
 * @throws {TypeCacheError} {@link TypeCacheError}
 * @group Contracts
 */
export type ICache<TType = unknown> = {
    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    has(key: string): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    get<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOrMany<TValues extends TType, TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TValues>>,
    ): Promise<Record<TKeys, TValues>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    insert<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs?: number | null,
    ): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    insertMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, InserItem<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    upsert<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
        ttlInMs?: number | null,
    ): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    upsertMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, InserItem<CacheValue<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    update<TValue extends TType>(
        key: string,
        value: CacheValue<TValue>,
    ): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, CacheValue<TValues>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    remove(key: string): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOr<TValue extends TType, TExtended extends TType = TValue>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getAndRemove<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getAndRemoveOr<TValue extends TType, TExtended extends TType = TValue>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOrInsert<TValue extends TType, TExtended extends TType = TValue>(
        key: string,
        insertValue: AsyncLazyable<CacheValue<TExtended>>,
        ttlInMs?: number | null,
    ): Promise<TValue | TExtended>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    updateIncrement(key: string, value: number): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    upsertIncrement(
        key: string,
        value: number,
        ttlInMs?: number | null,
    ): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    updateDecrement(key: string, value: number): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    upsertDecrement(
        key: string,
        value: number,
        ttlInMs?: number | null,
    ): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    clear(): Promise<void>;
};

/**
 * @module Cache
 */

import {
    type InserItem,
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
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    hasMany?<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>>;

    insertMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<InserItem<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    upsertMany?<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<InserItem<TValues>>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>>;

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
    getAndRemove?<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOrInsert?<TValue extends TType, TExtended extends TType = TValue>(
        key: string,
        insertValue: TExtended,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    updateIncrement?(key: string, value: number): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    upsertIncrement?(
        key: string,
        value: number,
        ttlInMs: number | null,
    ): Promise<boolean>;

    /**
     * @throws {CacheError} {@link CacheError}
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    clear(): Promise<void>;
};

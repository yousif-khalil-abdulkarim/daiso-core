/**
 * @module Cache
 */

import type { ITask } from "@/task/contracts/_module.js";
import type {
    AsyncLazyable,
    Invokable,
    NoneFunc,
    Promisable,
} from "@/utilities/_module.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    KeyNotFoundCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    KeyExistsCacheError,
} from "@/new-cache/contracts/cache.errors.js";
import type { CacheEventMap } from "@/new-cache/contracts/cache.events.js";
import type { IEventListenable } from "@/event-bus/contracts/_module.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";
import type { BackoffPolicy } from "@/backoff-policies/_module.js";
import type { TimeSpan } from "@/time-span/implementations/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type CacheWriteSettings = {
    ttl?: ITimeSpan | null;

    staleTtl?: ITimeSpan;

    jitter?: number | null;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type GetOrPutSettings = CacheWriteSettings & {
    /**
     * You can set lock ttl used for locking data source. If you pass null locking will be disabled.
     */
    lockTtl?: ITimeSpan | null;

    /**
     * You can set maximal times you can retry acquiring lock.
     */
    lockMaxAttempts?: number;

    /**
     * You can set backoff policy for retrying acquiring lock.
     */
    lockBackoffPolicy?: BackoffPolicy;

    /**
     * @default false
     */
    forceFresh?: boolean;

    /**
     * @default false
     */
    cacheNullable?: boolean;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type GetOrPutInvokableReturn<TType = unknown> = CacheWriteSettings & {
    value: TType;

    /**
     * @default false
     */
    cacheNullable?: boolean;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type GetOrPutInvokable<TType = unknown> = Invokable<
    [staleValue: TType | null],
    Promisable<GetOrPutInvokableReturn<TType>>
>;

/**
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type GetOrPutDynamic<TType> = ITask<TType> | GetOrPutInvokable<TType>;

/**
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type GetOrPutValue<TType = unknown> = TType | GetOrPutDynamic<TType>;

/**
 * The `ICacheBase` contract defines a way for as key-value pairs independent of data storage.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheBase<TType> = {
    /**
     * The `exists` method returns true when `key` is found otherwise false will be returned.
     */
    exists(key: string): ITask<boolean>;

    /**
     * The `missing` method returns true when `key` is not found otherwise false will be returned.
     */
    missing(key: string): ITask<boolean>;

    /**
     * The `get` method returns the value when `key` is found otherwise null will be returned.
     */
    get(key: string): ITask<TType | null>;

    /**
     * The `getOrFail` method returns the value when `key` is found otherwise an error will be thrown.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getOrFail(key: string): ITask<TType>;

    /**
     * The `getAndRemove` method returns the value when `key` is found otherwise null will be returned.
     */
    getAndRemove(key: string): ITask<TType | null>;

    /**
     * The `getAndRemoveOrFail` method returns the value when `key` is found otherwise an error will thrown.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getAndRemoveOrFail(key: string): ITask<TType>;

    /**
     * The `getOrPut` method will retrieve the given `key` if found otherwise `valueToAdd` will be added and returned.
     */
    getOrPut(
        key: string,
        value: GetOrPutValue<NoneFunc<TType>>,
        settings?: GetOrPutSettings,
    ): ITask<TType>;

    /**
     * 
     */
    hasExpiration(key: string): ITask<boolean>;

    /**
     * 
     */
    getExpiration(key: string): ITask<TimeSpan | null>;

    /**
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getExpirationOrFail(key: string): ITask<TimeSpan>;

    /**
     * 
     */
    expire(key: string): ITask<boolean>;

    /**
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    expireOrFail(key: string): ITask<void>;

    /**
     * The `getOr` method will retrieve the given `key` if found otherwise `defaultValue` will be returned.
     *
     * @param defaultValue - can be regular value, sync or async {@link Invokable | `Invokable`} value and {@link ITask | `ITask`} value.
     */
    getOr(
        key: string,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): ITask<TType>;

    /**
     * The `add` method adds a `key` with given `value` when key doesn't exists.
     *
     * @returns Returns true when key doesn't exists otherwise false will be returned.
     */
    add(
        key: string,
        value: TType,
        settings?: CacheWriteSettings,
    ): ITask<boolean>;

    /**
     * The `addOrFail` method adds a `key` with given `value` when key doesn't exists.
     * Throws an error when key alreadyExists.
     *
     * @throws {KeyExistsCacheError} {@link KeyExistsCacheError}
     */
    addOrFail(
        key: string,
        value: TType,
        settings?: CacheWriteSettings,
    ): ITask<void>;

    /**
     * The `put` method replaces th given `key` with the given `value` and `ttl` if the `key` exists
     * othwerwise it will add the given `value` with the given `ttl`.
     *
     * @returns Returns true if the `key` where replaced otherwise false is returned.
     */
    put(
        key: string,
        value: TType,
        settings?: CacheWriteSettings,
    ): ITask<boolean>;

    /**
     * The `update` method updates the given `key` with given `value`.
     * Throws an error when key is not found.
     *
     * @returns Returns true if the `key` where updated otherwise false will be returned.
     */
    update(key: string, value: TType): ITask<boolean>;

    /**
     * The `updateOrFail` method updates the given `key` with given `value`.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    updateOrFail(key: string, value: TType): ITask<void>;

    /**
     * The `increment` method increments the given `key` with given `value`.
     * An error will thrown if the key is not a number.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @returns Returns true if the `key` where incremented otherwise false will be returned.
     *
     * @throws {TypeError} {@link TypeError}
     */
    increment(key: string, value?: Extract<TType, number>): ITask<boolean>;

    /**
     * The `incrementOrFail` method increments the given `key` with given `value`.
     * An error will thrown if the key is not a number.
     * Throws an error if key is not found.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     * @throws {TypeError} {@link TypeError}
     */
    incrementOrFail(key: string, value?: Extract<TType, number>): ITask<void>;

    /**
     * The `decrement` method decrements the given `key` with given `value`.
     * An error will thrown if the key is not a number.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @returns Returns true if the `key` where decremented otherwise false will be returned.
     *
     * @throws {TypeError} {@link TypeError}
     */
    decrement(key: string, value?: Extract<TType, number>): ITask<boolean>;

    /**
     * The `decrementOrFail` method decrements the given `key` with given `value`.
     * An error will thrown if the key is not a number.
     * Throws an error if key is not found.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     * @throws {TypeError} {@link TypeError}
     */
    decrementOrFail(key: string, value?: Extract<TType, number>): ITask<void>;

    /**
     * The `remove` method removes the given `key`.
     *
     * @returns Returns true if the key is found otherwise false is returned.
     */
    remove(key: string): ITask<boolean>;

    /**
     * The `removeOrFail` method removes the given `key`.
     * Throws error if key not found.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    removeOrFail(key: string): ITask<void>;

    /**
     * The `removeMany` method removes many keys.
     *
     * @param keys - The param items can be a string or an `Iterable` of strings.
     * If the param items are an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @returns Returns true if one of the keys where deleted otherwise false is returned.
     */
    removeMany(keys: Iterable<string>): ITask<boolean>;

    /**
     * The `clear` method removes all the keys in the cache. If a cache is in a group then only the keys part of the group will be removed.
     */
    clear(): ITask<void>;
};

/**
 * The `ICacheListenable` contract defines a way for listening {@link ICache | `ICache`} operation events.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheListenable<TType = unknown> = IEventListenable<
    CacheEventMap<TType>
>;

/**
 * The `ICache` contract defines a way for as key-value pairs independent of data storage and listening to operation events.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICache<TType = unknown> = ICacheListenable<TType> &
    ICacheBase<TType>;

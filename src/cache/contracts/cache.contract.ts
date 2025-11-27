/**
 * @module Cache
 */

import type { Task } from "@/task/_module-exports.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Invokable,
} from "@/utilities/_module-exports.js";
import type { AsyncLazyable, NoneFunc } from "@/utilities/_module-exports.js";
import type { CacheEventMap } from "@/cache/contracts/cache.events.js";
import type { IEventListenable } from "@/event-bus/contracts/_module-exports.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";

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
 * The `ICacheBase` contract defines a way for as key-value pairs independent of data storage.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheBase<TType = unknown> = {
    /**
     * The `exists` method returns true when `key` is found otherwise false will be returned.
     */
    exists(key: string): Task<boolean>;

    /**
     * The `missing` method returns true when `key` is not found otherwise false will be returned.
     */
    missing(key: string): Task<boolean>;

    /**
     * The `get` method returns the value when `key` is found otherwise null will be returned.
     */
    get(key: string): Task<TType | null>;

    /**
     * The `getOrFail` method returns the value when `key` is found otherwise an error will be thrown.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getOrFail(key: string): Task<TType>;

    /**
     * The `getAndRemove` method returns the value when `key` is found otherwise null will be returned.
     * The key will be removed after it is returned.
     */
    getAndRemove(key: string): Task<TType | null>;

    /**
     * The `getOr` method will retrieve the given `key` if found otherwise `defaultValue` will be returned.
     *
     * @param defaultValue - can be regular value, sync or async {@link Invokable | `Invokable`} value and {@link Task | `Task`} value.
     */
    getOr(
        key: string,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): Task<TType>;

    /**
     * The `getOrAdd` method will retrieve the given `key` if found otherwise `valueToAdd` will be added and returned.
     *
     * @param valueToAdd - can be regular value, sync or async {@link Invokable | `Invokable`} value and {@link Task | `Task`} value.
     */
    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<NoneFunc<TType>>,
        ttl?: ITimeSpan | null,
    ): Task<TType>;

    /**
     * The `add` method adds a `key` with given `value` when key doesn't exists.
     *
     * @param ttl - If null is passed, the item will not expire.
     *
     * @returns Returns true when key doesn't exists otherwise false will be returned.
     */
    add(key: string, value: TType, ttl?: ITimeSpan | null): Task<boolean>;

    /**
     * The `put` method replaces th given `key` with the given `value` and `ttl` if the `key` exists
     * othwerwise it will add the given `value` with the given `ttl`.
     *
     * @param ttl - If null is passed, the item will not expire.
     *
     * @returns Returns true if the `key` where replaced otherwise false is returned.
     */
    put(key: string, value: TType, ttl?: ITimeSpan | null): Task<boolean>;

    /**
     * The `update` method updates the given `key` with given `value`.
     *
     * @returns Returns true if the `key` where updated otherwise false will be returned.
     */
    update(key: string, value: TType): Task<boolean>;

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
    increment(key: string, value?: Extract<TType, number>): Task<boolean>;

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
    decrement(key: string, value?: Extract<TType, number>): Task<boolean>;

    /**
     * The `remove` method removes the given `key`.
     *
     * @returns Returns true if the key is found otherwise false is returned.
     */
    remove(key: string): Task<boolean>;

    /**
     * The `removeMany` method removes many keys.
     *
     * @param keys - The param items can be a string or an `Iterable` of strings.
     * If the param items are an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @returns Returns true if one of the keys where deleted otherwise false is returned.
     */
    removeMany(keys: Iterable<string>): Task<boolean>;

    /**
     * The `clear` method removes all the keys in the cache. If a cache is in a group then only the keys part of the group will be removed.
     */
    clear(): Task<void>;
};

/**
 * The `ICache` contract defines a way for as key-value pairs independent of data storage and listening to operation events.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICache<TType = unknown> = ICacheListenable<TType> &
    ICacheBase<TType>;

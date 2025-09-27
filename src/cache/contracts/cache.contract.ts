/**
 * @module Cache
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Invokable,
    ITimeSpan,
} from "@/utilities/_module-exports.js";
import type {
    AsyncLazyable,
    NoneFunc,
    OneOrMore,
} from "@/utilities/_module-exports.js";
import type { CacheEventMap } from "@/cache/contracts/cache.events.js";
import type { IEventListenable } from "@/event-bus/contracts/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TypeCacheError } from "@/cache/contracts/cache.errors.js";

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
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     */
    exists(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The `missing` method returns true when `key` is not found otherwise false will be returned.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     */
    missing(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The `get` method returns the value when `key` is found otherwise null will be returned.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     */
    get(key: OneOrMore<string>): LazyPromise<TType | null>;

    /**
     * The `getOrFail` method returns the value when `key` is found otherwise an error will be thrown.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getOrFail(key: OneOrMore<string>): LazyPromise<TType>;

    /**
     * The `getAndRemove` method returns the value when `key` is found otherwise null will be returned.
     * The key will be removed after it is returned.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     */
    getAndRemove(key: OneOrMore<string>): LazyPromise<TType | null>;

    /**
     * The `getOr` method will retrieve the given `key` if found otherwise `defaultValue` will be returned.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @param defaultValue - can be regular value, sync or async {@link Invokable | `Invokable`} value and {@link LazyPromise| `LazyPromise`} value.
     */
    getOr(
        key: OneOrMore<string>,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): LazyPromise<TType>;

    /**
     * The `getOrAdd` method will retrieve the given `key` if found otherwise `valueToAdd` will be added and returned.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @param valueToAdd - can be regular value, sync or async {@link Invokable | `Invokable`} value and {@link LazyPromise| `LazyPromise`} value.
     */
    getOrAdd(
        key: OneOrMore<string>,
        valueToAdd: AsyncLazyable<NoneFunc<TType>>,
        ttl?: ITimeSpan | null,
    ): LazyPromise<TType>;

    /**
     * The `add` method adds a `key` with given `value` when key doesn't exists.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @param ttl - If null is passed, the item will not expire.
     *
     * @returns Returns true when key doesn't exists otherwise false will be returned.
     */
    add(
        key: OneOrMore<string>,
        value: TType,
        ttl?: ITimeSpan | null,
    ): LazyPromise<boolean>;

    /**
     * The `put` method replaces th given `key` with the given `value` and `ttl` if the `key` exists
     * othwerwise it will add the given `value` with the given `ttl`.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @param ttl - If null is passed, the item will not expire.
     *
     * @returns Returns true if the `key` where replaced otherwise false is returned.
     */
    put(
        key: OneOrMore<string>,
        value: TType,
        ttl?: ITimeSpan | null,
    ): LazyPromise<boolean>;

    /**
     * The `update` method updates the given `key` with given `value`.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @returns Returns true if the `key` where updated otherwise false will be returned.
     */
    update(key: OneOrMore<string>, value: TType): LazyPromise<boolean>;

    /**
     * The `increment` method increments the given `key` with given `value`.
     * An error will thrown if the key is not a number.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @returns Returns true if the `key` where incremented otherwise false will be returned.
     *
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The `decrement` method decrements the given `key` with given `value`.
     * An error will thrown if the key is not a number.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @returns Returns true if the `key` where decremented otherwise false will be returned.
     *
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    decrement(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The `remove` method removes the given `key`.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @returns Returns true if the key is found otherwise false is returned.
     */
    remove(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The `removeMany` method removes many keys.
     *
     * @param keys - The param items can be a string or an `Iterable` of strings.
     * If the param items are an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     *
     * @returns Returns true if one of the keys where deleted otherwise false is returned.
     */
    removeMany(keys: Iterable<OneOrMore<string>>): LazyPromise<boolean>;

    /**
     * The `clear` method removes all the keys in the cache. If a cache is in a group then only the keys part of the group will be removed.
     */
    clear(): LazyPromise<void>;
};

/**
 * The `ICache` contract defines a way for as key-value pairs independent of data storage and listening to operation events.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICache<TType = unknown> = ICacheListenable<TType> &
    ICacheBase<TType>;

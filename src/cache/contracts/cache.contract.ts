/**
 * @module Cache
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Invokable,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import type {
    AsyncLazyable,
    NoneFunc,
    OneOrMore,
} from "@/utilities/_module-exports.js";
import type { CacheEvents } from "@/cache/contracts/cache.events.js";
import type { IEventListenable } from "@/event-bus/contracts/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TypeCacheError } from "@/cache/contracts/cache.errors.js";

/**
 * The <i>ICacheListenable</i> contract defines a way for listening <i>{@link ICache}</i> operation events.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheListenable<TType = unknown> = IEventListenable<
    CacheEvents<TType>
>;

/**
 * The <i>ICacheBase</i> contract defines a way for as key-value pairs independent of data storage.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheBase<TType = unknown> = {
    /**
     * The <i>exists</i> method returns true when <i>key</i> is found otherwise false will be returned.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     */
    exists(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The <i>missing</i> method returns true when <i>key</i> is not found otherwise false will be returned.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     */
    missing(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The <i>get</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     */
    get(key: OneOrMore<string>): LazyPromise<TType | null>;

    /**
     * The <i>getOrFail</i> method returns the value when <i>key</i> is found otherwise an error will be thrown.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getOrFail(key: OneOrMore<string>): LazyPromise<TType>;

    /**
     * The <i>getAndRemove</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     * The key will be removed after it is returned.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     */
    getAndRemove(key: OneOrMore<string>): LazyPromise<TType | null>;

    /**
     * The <i>getOr</i> method will retrieve the given <i>key</i> if found otherwise <i>defaultValue</i> will be returned.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @param defaultValue - can be regular value, sync or async <i>{@link Invokable}</i> value and <i>{@link LazyPromise}</i> value.
     */
    getOr(
        key: OneOrMore<string>,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): LazyPromise<TType>;

    /**
     * The <i>getOrAdd</i> method will retrieve the given <i>key</i> if found otherwise <i>valueToAdd</i> will be added and returned.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @param valueToAdd - can be regular value, sync or async <i>{@link Invokable}</i> value and <i>{@link LazyPromise}</i> value.
     */
    getOrAdd(
        key: OneOrMore<string>,
        valueToAdd: AsyncLazyable<NoneFunc<TType>>,
        ttl?: TimeSpan | null,
    ): LazyPromise<TType>;

    /**
     * The <i>add</i> method adds a <i>key</i> with given <i>value</i> when key doesn't exists.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @param ttl - If null is passed, the item will not expire.
     *
     * @returns true when key doesn't exists otherwise false will be returned.
     */
    add(
        key: OneOrMore<string>,
        value: TType,
        ttl?: TimeSpan | null,
    ): LazyPromise<boolean>;

    /**
     * The <i>put</i> method replaces th given <i>key</i> with the given <i>value</i> and <i>ttl</i> if the <i>key</i> exists
     * othwerwise it will add the given <i>value</i> with the given <i>ttl</i>.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @param ttl - If null is passed, the item will not expire.
     *
     * @returns true if the <i>key</i> where replaced otherwise false is returned.
     */
    put(
        key: OneOrMore<string>,
        value: TType,
        ttl?: TimeSpan | null,
    ): LazyPromise<boolean>;

    /**
     * The <i>update</i> method updates the given <i>key</i> with given <i>value</i>.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @returns true if the <i>key</i> where updated otherwise false will be returned.
     */
    update(key: OneOrMore<string>, value: TType): LazyPromise<boolean>;

    /**
     * The <i>increment</i> method increments the given <i>key</i> with given <i>value</i>.
     * An error will thrown if the key is not a number.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @returns true if the <i>key</i> where incremented otherwise false will be returned.
     *
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The <i>decrement</i> method decrements the given <i>key</i> with given <i>value</i>.
     * An error will thrown if the key is not a number.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @param value - If not defined then it will be defaulted to 1.
     *
     * @returns true if the <i>key</i> where decremented otherwise false will be returned.
     *
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    decrement(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The <i>remove</i> method removes the given <i>key</i>.
     *
     * @param key - can be a string or an <i>Iterable</i> of strings.
     * If it's an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @returns true if the key is found otherwise false is returned.
     */
    remove(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The <i>removeMany</i> method removes many keys.
     *
     * @param keys - The param items can be a string or an <i>Iterable</i> of strings.
     * If the param items are an <i>Iterable</i>, it will be joined into a single string.
     * Think of an <i>Iterable</i> as representing a path.
     *
     * @returns true if one of the keys where deleted otherwise false is returned.
     */
    removeMany(keys: Iterable<OneOrMore<string>>): LazyPromise<boolean>;

    /**
     * The <i>clear</i> method removes all the keys in the cache. If a cache is in a group then only the keys part of the group will be removed.
     */
    clear(): LazyPromise<void>;
};

/**
 * The <i>ICache</i> contract defines a way for as key-value pairs independent of data storage and listening to operation events.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICache<TType = unknown> = ICacheListenable<TType> &
    ICacheBase<TType>;

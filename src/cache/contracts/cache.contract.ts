/**
 * @module Cache
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type {
    AsyncLazyable,
    NoneFunction,
    OneOrMore,
} from "@/utilities/types.js";
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
     */
    exists(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The <i>missing</i> method returns true when <i>key</i> is not found otherwise false will be returned.
     */
    missing(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The <i>get</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     */
    get(key: OneOrMore<string>): LazyPromise<TType | null>;

    /**
     * The <i>getOrFail</i> method returns the value when <i>key</i> is found otherwise an error will be thrown.
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getOrFail(key: OneOrMore<string>): LazyPromise<TType>;

    /**
     * The <i>getAndRemove</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     * The key will be removed after it is returned.
     */
    getAndRemove(key: OneOrMore<string>): LazyPromise<TType | null>;

    /**
     * The <i>getOr</i> method will retrieve the given <i>key</i> if found otherwise <i>defaultValue</i> will be returned.
     * The <i>defaultValue<i> can be async or sync function.
     */
    getOr(
        key: OneOrMore<string>,
        defaultValue: AsyncLazyable<NoneFunction<TType>>,
    ): LazyPromise<TType>;

    /**
     * The <i>getOrAdd</i> method will retrieve the given <i>key</i> if found otherwise <i>valueToAdd</i> will be added and returned.
     * The <i>valueToAdd<i> can be async, sync function and <i>{@link LazyPromise}</i>.
     */
    getOrAdd(
        key: OneOrMore<string>,
        valueToAdd: AsyncLazyable<NoneFunction<TType>>,
        ttl?: TimeSpan | null,
    ): LazyPromise<TType>;

    /**
     * The <i>add</i> method adds a <i>key</i> with given <i>value</i> when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * You can provide a <i>ttl</i> value. If null is passed, the item will not expire.
     */
    add(
        key: OneOrMore<string>,
        value: TType,
        ttl?: TimeSpan | null,
    ): LazyPromise<boolean>;

    /**
     * The <i>put</i> method replaces th given <i>key</i> with the given <i>value</i> and <i>ttl</i> if the <i>key</i> exists othwerwise it will add the given <i>value</i> and <i>ttl</i>.
     * Returns true if the <i>key</i> where replaced otherwise false is returned.
     */
    put(
        key: OneOrMore<string>,
        value: TType,
        ttl?: TimeSpan | null,
    ): LazyPromise<boolean>;

    /**
     * The <i>update</i> method updates the given <i>key</i> with given <i>value</i>. Returns true if the <i>key</i> where updated otherwise false will be returned.
     */
    update(key: OneOrMore<string>, value: TType): LazyPromise<boolean>;

    /**
     * The <i>increment</i> method increments the given <i>key</i> with given <i>value</i>. Returns true if the <i>key</i> where incremented otherwise false will be returned.
     * If <i>values</i> is not defined then it will increment the key with 1.
     * An error will thrown if the key is not a number.
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The <i>decrement</i> method decrements the given <i>key</i> with given <i>value</i>. Returns true if the <i>key</i> where decremented otherwise false will be returned.
     * If <i>values</i> is not defined then it will decrement the key with 1.
     * An error will thrown if the key is not a number.
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    decrement(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The <i>remove</i> method removes the given <i>key</i>. Returns true if the key is found otherwise false is returned.
     */
    remove(key: OneOrMore<string>): LazyPromise<boolean>;

    /**
     * The <i>removeMany</i> method removes many keys. Returns true if one of the keys where deleted otherwise false is returned.
     */
    removeMany(keys: OneOrMore<string>[]): PromiseLike<boolean>;

    /**
     * The <i>clear</i> method removes all the keys in the cache. If a cache is in a group then only the keys part of the group will be removed.
     */
    clear(): LazyPromise<void>;

    /**
     * The <i>getGroup</i> method returns the group name of the cache. If the cache is not part of a group then null is returned.
     */
    getGroup(): string | null;
};

/**
 * The <i>ICache</i> contract defines a way for as key-value pairs independent of data storage and listening to operation events.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICache<TType = unknown> = ICacheListenable<TType> &
    ICacheBase<TType>;

/**
 * The <i>IGroupableCache</i> contract defines a way for storing and grouping data as key-value pairs independent of data storage.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type IGroupableCache<TType = unknown> = ICache<TType> & {
    /**
     * The <i>withGroup</i> method returns a new <i>{@link ICache}</i> instance that groups keys together.
     * Only keys in the same group will be updated, removed, or retrieved, leaving keys outside the group unaffected.
     * This useful for multitennat applications.
     */
    withGroup(group: OneOrMore<string>): ICache<TType>;
};

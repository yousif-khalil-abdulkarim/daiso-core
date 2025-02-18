/**
 * @module Cache
 */

import type { IEventListenable } from "@/event-bus/contracts/_module-exports.js";
import type { OneOrMore } from "@/utilities/_module-exports.js";
import {
    type AsyncLazyable,
    type GetOrAddValue,
} from "@/utilities/_module-exports.js";
import type { CacheEvents } from "@/cache/contracts/_module-exports.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyNotFoundCacheError,
} from "@/cache/contracts/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";

/**
 * The <i>ICacheListenable</i> contract defines a way for listening <i>{@link ICache}</i> operations.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheListenable<TType = unknown> = IEventListenable<
    CacheEvents<TType>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type WithTtlValue<TType> = {
    value: TType;
    /**
     * You can provide a <i>ttl</i> value. If null is passed, the item will not expire.
     */
    ttl?: TimeSpan | null;
};

/**
 * The <i>ICache</i> contract defines a way for storing data as key-value pairs independent of data storage.
 * It commes with more convient methods compared to <i>ICacheAdapter</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICache<TType = unknown> = ICacheListenable & {
    /**
     * The <i>exists</i> method returns true when <i>key</i> is found otherwise false will be returned.
     */
    exists(key: string): LazyPromise<boolean>;

    /**
     * The <i>existsMany</i> method returns true for the <i>keys</i> that are found otherwise false will be returned.
     */
    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>missing</i> method returns true when <i>key</i> is not found otherwise false will be returned.
     */
    missing(key: string): LazyPromise<boolean>;

    /**
     * The <i>missingMany</i> method returns true for the <i>keys</i> that are not found otherwise false will be returned.
     */
    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>get</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     */
    get(key: string): LazyPromise<TType | null>;

    /**
     * The <i>getMany</i> returns the value for the <i>keys</i> that are found otherwise null will be returned.
     */
    getMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TType | null>>;

    /**
     * The <i>getOr</i> method returns the value when <i>key</i> is found otherwise <i>defaultValue</i> will be returned.
     */
    getOr(key: string, defaultValue: AsyncLazyable<TType>): LazyPromise<TType>;

    /**
     * The <i>getOrMany</i> method returns the value for the keys that are found otherwise defaultValue will be returned.
     */
    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): LazyPromise<Record<TKeys, TType>>;

    /**
     * The <i>getOrFail</i> method returns the value when <i>key</i> is found otherwise an error will be thrown.
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getOrFail(key: string): LazyPromise<TType>;

    /**
     * The <i>add</i> method adds a <i>key</i> with given <i>value</i> when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * You can provide a <i>ttl</i> value. If null is passed, the item will not expire.
     */
    add(key: string, value: TType, ttl?: TimeSpan | null): LazyPromise<boolean>;

    /**
     * The <i>addMany</i> method adds new keys. Returns true for the keys that where added otherwise false will be returned.
     */
    addMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>update</i> method updates the given <i>key</i> with given <i>value</i>. Returns true when key otherwise false will be returned.
     */
    update(key: string, value: TType): LazyPromise<boolean>;

    /**
     * The <i>updateMany</i> method updates the given keys. Returns true for the keys that where updated otherwise false will be returned.
     */
    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>put</i> method replaces a <i>key</i> if the <i>key</i> exists including the ttl value or adds <i>key</i> that do not exists with a given <i>ttl</i>.
     * Returns true if the <i>key</i> where replaced otherwise false is returned.
     * You can provide a <i>ttl</i> value for the replaced key. If <i>null</i> is passed, the item will not expires and <i>null</i> is the default value.
     */
    put(key: string, value: TType, ttl?: TimeSpan | null): LazyPromise<boolean>;

    /**
     * The <i>putMany</i> method replaces the keys that exists including their ttl values or adds keys that do not exists.
     * Returns true for all the keys that where replaced otherwise false is returned.
     */
    putMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>remove</i> method removes the given <i>key</i> when found. Returns true if the key is found otherwise false is returned.
     */
    remove(key: string): LazyPromise<boolean>;

    /**
     * The <i>removeMany</i> method removes keys. Returns true for the keys that are removed otherwise false is returned.
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>getAndRemove</i> method removes the given <i>key</i> and returns it when found otherwise null will be returned.
     */
    getAndRemove(key: string): LazyPromise<TType | null>;

    /**
     * The <i>getOrAdd</i> method will retrieve the given <i>key</i> if found otherwise <i>valueToAdd</i> will be added and returned.
     * The <i>valueToAdd<i> can be async or sync function.
     */
    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<GetOrAddValue<TType>>,
        ttl?: TimeSpan | null,
    ): LazyPromise<TType>;

    /**
     * The <i>increment</i> method will increment the given <i>key</i> if found otherwise nonthing will occur.
     * Returns true if key is incremented otherwise false will be returned.
     * An error will thrown if the key is not a number.
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment(
        key: string,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The <i>decrement</i> method will decrement the given <i>key</i> if found otherwise nonthing will occur.
     * Returns true if key exists otherwise false will be returned.
     * An error will thrown if the key is not a number.
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    decrement(
        key: string,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The <i>clear</i> method removes all the keys in the cache.
     */
    clear(): LazyPromise<void>;

    /**
     * The <i>getGroup</i> method returns the group name.
     */
    getGroup(): string;
};

/**
 * The <i>IGroupableCache</i> contract defines a way for storing data as key-value pairs independent of data storage.
 * It commes with one extra method which is useful for multitennat applications compared to <i>{@link ICache}</i>.
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

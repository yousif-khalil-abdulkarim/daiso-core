/**
 * @module Cache
 */

import type { IListenable } from "@/event-bus/contracts/_module";
import type { OneOrMore } from "@/_shared/types";
import { type AsyncLazyable, type GetOrAddValue } from "@/_shared/types";
import type { AllCacheEvents } from "@/cache/contracts/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyNotFoundCacheError,
} from "@/cache/contracts/_module";
import type { LazyPromise, TimeSpan } from "@/utilities/_module";

/**
 * The <i>ICacheListenable</i> contract defines a way for listening <i>{@link ICache}</i> crud operations.
 * @group Contracts
 */
export type ICacheListenable<TType = unknown> = IListenable<
    AllCacheEvents<TType>
>;

/**
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
 * @group Contracts
 */
export type ICache<TType = unknown> = ICacheListenable & {
    /**
     * The <i>exists</i> method returns true when <i>key</i> is found otherwise false will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    exists(key: string): LazyPromise<boolean>;

    /**
     * The <i>existsMany</i> method returns true for the <i>keys</i> that are found otherwise false will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>missing</i> method returns true when <i>key</i> is not found otherwise false will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    missing(key: string): LazyPromise<boolean>;

    /**
     * The <i>missingMany</i> method returns true for the <i>keys</i> that are not found otherwise false will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>get</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    get(key: string): LazyPromise<TType | null>;

    /**
     * The <i>getMany</i> returns the value for the <i>keys</i> that are found otherwise null will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TType | null>>;

    /**
     * The <i>getOr</i> method returns the value when <i>key</i> is found otherwise <i>defaultValue</i> will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOr(key: string, defaultValue: AsyncLazyable<TType>): LazyPromise<TType>;

    /**
     * The <i>getOrMany</i> method returns the value for the keys that are found otherwise defaultValue will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): LazyPromise<Record<TKeys, TType>>;

    /**
     * The <i>getOrFail</i> method returns the value when <i>key</i> is found otherwise an error will be thrown.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     */
    getOrFail(key: string): LazyPromise<TType>;

    /**
     * The <i>add</i> method adds a <i>key</i> with given <i>value</i> when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * You can provide a <i>ttl</i> value. If null is passed, the item will not expire.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    add(key: string, value: TType, ttl?: TimeSpan | null): LazyPromise<boolean>;

    /**
     * The <i>addMany</i> method adds new keys. Returns true for the keys that where added otherwise false will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    addMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>update</i> method updates the given <i>key</i> with given <i>value</i>. Returns true when key otherwise false will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    update(key: string, value: TType): LazyPromise<boolean>;

    /**
     * The <i>updateMany</i> method updates the given keys. Returns true for the keys that where updated otherwise false will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>put</i> method replaces the key with given <i>value</i> if found. If the <i>key</i> is not found it will just be added. True is returned if the key is found otherwise false will be returned.
     * You can provide a <i>ttl</i> value. If null is passed, the item will not expire.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    put(key: string, value: TType, ttl?: TimeSpan | null): LazyPromise<boolean>;

    /**
     * The <i>putMany</i> method replaces the keys that exists. Adds keys that do not exists. Return true for all the keys that where updated otherwise false is returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    putMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>remove</i> method removes the given <i>key</i> when found. Returns true if the key is found otherwise false is returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    remove(key: string): LazyPromise<boolean>;

    /**
     * The <i>removeMany</i> method removes keys. Returns true for the keys that are removed otherwise false is returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>getAndRemove</i> method removes the given <i>key</i> and returns it when found otherwise null will be returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    getAndRemove(key: string): LazyPromise<TType | null>;

    /**
     * The <i>getOrAdd</i> method will retrieve the given <i>key</i> if found otherwise <i>valueToAdd</i> will be added and returned.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
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
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
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
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     * @throws {TypeCacheError} {@link TypeCacheError}
     * An error will thrown if the key is not a number.
     */
    decrement(
        key: string,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    /**
     * The <i>clear</i> method removes all the keys in the cache.
     * @throws {UnexpectedCacheError} {@link UnexpectedCacheError}
     */
    clear(): LazyPromise<void>;

    /**
     * The <i>getNamespace</i> method returns the complete namespace.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * async function main(cache: ICache) {
     *   // Will be "@root"
     *   console.log(cache.getNamespace())
     *
     *   const cacheA = cache.withNamespace("a");
     *
     *   // Will be "@root/a"
     *   console.log(cacheA.getNamespace())
     * }
     * ```
     */
    getNamespace(): string;
};

/**
 * The <i>INamespacedCache</i> contract defines a way for storing data as key-value pairs independent of data storage.
 * It commes with one extra method which is useful for multitennat applications compared to <i>ICache</i>.
 * @group Contracts
 */
export type INamespacedCache<TType = unknown> = ICache<TType> & {
    /**
     * The <i>withNamespace</i> method returns new instance of <i>{@link ICache}</i> where all the keys will be prefixed with a given <i>namespace</i>.
     * This useful for multitennat applications.
     * @example
     * ```ts
     * import { type ICache } from "@daiso-tech/core";
     *
     * async function main(cache: ICache): Promise<void> {
     *   const cacheA = cache.withNamespace("a");
     *   await cacheA.add("a", 1);
     *
     *   const cacheB = cache.withNamespace("b");
     *   await cacheB.add("b", 2);
     *
     *   // Will print { a: 1, b: null }
     *   console.log(await cacheA.getMany(["a", "b"]));
     * }
     * ```
     */
    withNamespace(namespace: OneOrMore<string>): ICache<TType>;
};

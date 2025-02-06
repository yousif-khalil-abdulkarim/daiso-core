/**
 * @module Cache
 */

import type { IEventListener } from "@/event-bus/contracts/_module";
import type { OneOrMore } from "@/utilities/_module";
import { type AsyncLazyable, type GetOrAddValue } from "@/utilities/_module";
import type { CacheEvents } from "@/cache/contracts/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCacheError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyNotFoundCacheError,
} from "@/cache/contracts/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { LazyPromise } from "@/async/_module";

/**
 * The <i>ICacheListener</i> contract defines a way for listening <i>{@link ICache}</i> operations.
 * @group Contracts
 */
export type ICacheListener<TType = unknown> = IEventListener<
    CacheEvents<TType>
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
export type ICache<TType = unknown> = ICacheListener & {
    /**
     * The <i>exists</i> method returns true when <i>key</i> is found otherwise false will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.exists("a");
     *   // false
     * }
     * ```
     */
    exists(key: string): LazyPromise<boolean>;

    /**
     * The <i>existsMany</i> method returns true for the <i>keys</i> that are found otherwise false will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.existsMany(["a", "b"]);
     *   // { a: false, b: false }
     * }
     * ```
     */
    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>missing</i> method returns true when <i>key</i> is not found otherwise false will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.exists("a");
     *   // true
     * }
     * ```
     */
    missing(key: string): LazyPromise<boolean>;

    /**
     * The <i>missingMany</i> method returns true for the <i>keys</i> that are not found otherwise false will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.existsMany(["a", "b"]);
     *   // { a: true, b: true }
     * }
     * ```
     */
    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>get</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.get("a");
     *   // null
     * }
     * ```
     */
    get(key: string): LazyPromise<TType | null>;

    /**
     * The <i>getMany</i> returns the value for the <i>keys</i> that are found otherwise null will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getMany(["a", "b"]);
     *   // { a: null, b: null }
     * }
     * ```
     */
    getMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TType | null>>;

    /**
     * The <i>getOr</i> method returns the value when <i>key</i> is found otherwise <i>defaultValue</i> will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOr("a", -1);
     *   // -1
     * }
     * ```
     * You can pass a function as default value.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOr("a", () => -1);
     *   // -1
     * }
     * ```
     * You can pass an async function as default value.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOr("a", async () => -1);
     *   // -1
     * }
     * ```
     * You can pass an <i>{@link LazyPromise}</i> as default value.
     * @example
     * ```ts
     * import type { ICache, IAsyncCollection } from "@daiso-tech/core";
     *
     * type IPerson = {
     *   name: string;
     *   age: number;
     * };
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache, collection: IAsyncCollection<IPerson>): Promise<void> {
     *   await cache.getOr("a", collection.first(person => person.name === "a"));
     * }
     * ```
     */
    getOr(key: string, defaultValue: AsyncLazyable<TType>): LazyPromise<TType>;

    /**
     * The <i>getOrMany</i> method returns the value for the keys that are found otherwise defaultValue will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOrMany({ a: -1, b: () => -2, c: async () => -3 });
     *   // { a: -1, b: -2, c: -3 }
     * }
     * ```
     * You can pass a function as default value.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOrMany({ a: () => -1 });
     *   // -1
     * }
     * ```
     * You can pass an async function as default value.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOrMany({ a: async () => -1 });
     *   // -1
     * }
     * ```
     * You can pass an <i>{@link LazyPromise}</i> as default value.
     * @example
     * ```ts
     * import type { ICache, IAsyncCollection } from "@daiso-tech/core";
     *
     * type IPerson = {
     *   name: string;
     *   age: number;
     * };
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache, collection: IAsyncCollection<IPerson>): Promise<void> {
     *   await cache.getOrMany({ a: collection.first(person => person.name === "a") });
     * }
     * ```
     */
    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): LazyPromise<Record<TKeys, TType>>;

    /**
     * The <i>getOrFail</i> method returns the value when <i>key</i> is found otherwise an error will be thrown.
     * @throws {KeyNotFoundCacheError} {@link KeyNotFoundCacheError}
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOrFail("a");
     *   // An error will be thrown
     * }
     * ```
     */
    getOrFail(key: string): LazyPromise<TType>;

    /**
     * The <i>add</i> method adds a <i>key</i> with given <i>value</i> when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * You can provide a <i>ttl</i> value. If null is passed, the item will not expire.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.add("a", 1);
     *   // true
     *
     *   await cache.add("a", 2);
     *   // false
     *
     *   await cache.get("a");
     *   // 1
     * }
     * ```
     * @example
     * ```ts
     * import { type ICache, TimeSpan, delay } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   const ttl = TimeSpan.fromSeconds(1);
     *
     *   await cache.add("a", 1, ttl);
     *   // true
     *
     *   await delay(ttl)
     *
     *   await cache.add("a", 2);
     *   // true
     *
     *   await cache.get("a");
     *   // 2
     * }
     * ```
     */
    add(key: string, value: TType, ttl?: TimeSpan | null): LazyPromise<boolean>;

    /**
     * The <i>addMany</i> method adds new keys. Returns true for the keys that where added otherwise false will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.addMany({ a: { value: 1 } });
     *   // { a: true }
     *
     *   await cache.addMany({ a: { value: 2 } });
     *   // { a: false }
     *
     *   await cache.get("a");
     *   // 1
     * }
     * ```
     * @example
     * ```ts
     * import { type ICache, TimeSpan, delay } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   const ttl = TimeSpan.fromSeconds(1);
     *
     *   await cache.addMany({ a: { value: 1, ttl } });
     *   // { a: true }
     *
     *   await delay(ttl)
     *
     *   await cache.addMany({ a: { value: 2 } });
     *   // { a: true }
     *
     *   await cache.get("a");
     *   // 2
     * }
     * ```
     */
    addMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>update</i> method updates the given <i>key</i> with given <i>value</i>. Returns true when key otherwise false will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.update("a", 1);
     *   // false
     *
     *   await cache.add("a", 1);
     *
     *
     *   await cache.update("a", 2);
     *   // true
     *
     *   await cache.get("a");
     *   // 2
     * }
     * ```
     */
    update(key: string, value: TType): LazyPromise<boolean>;

    /**
     * The <i>updateMany</i> method updates the given keys. Returns true for the keys that where updated otherwise false will be returned.
     *
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.updateMany({ a: 1 });
     *   // false
     *
     *   await cache.add("a", 1);
     *
     *   await cache.updateMany({ a: 2 });
     *   // true
     *
     *   await cache.get("a");
     *   // 2
     * }
     * ```
     */
    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>put</i> method replaces a <i>key</i> if the <i>key</i> exists including the ttl value or adds <i>key</i> that do not exists with a given <i>ttl</i>.
     * Returns true if the <i>key</i> where replaced otherwise false is returned.
     * You can provide a <i>ttl</i> value for the replaced key. If <i>null</i> is passed, the item will not expires and <i>null</i> is the default value.
     * @example
     * ```ts
     * import { type ICache, TimeSpan, delay } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.put("a", 1);
     *   // false
     *
     *   const ttl = TimeSpan.fromSeconds(1);
     *   await cache.put("a", 2, ttl);
     *   // true
     *
     *   await cache.get("a");
     *   // 2
     *
     *   await delay(ttl);
     *   await cache.get("a");
     *   // null
     * }
     * ```
     */
    put(key: string, value: TType, ttl?: TimeSpan | null): LazyPromise<boolean>;

    /**
     * The <i>putMany</i> method replaces the keys that exists including their ttl values or adds keys that do not exists.
     * Returns true for all the keys that where replaced otherwise false is returned.
     * @example
     * ```ts
     * import { type ICache, TimeSpan, delay } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.putMany({ a: { value: 1 } });
     *   // { a: false }
     *
     *   const ttl = TimeSpan.fromSeconds(1);
     *   await cache.put({ a: { value: 2, ttl } });
     *   // { a: true }
     *
     *   await cache.get("a");
     *   // 2
     *
     *   await delay(ttl);
     *   await cache.get("a");
     *   // null
     * }
     * ```
     */
    putMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>remove</i> method removes the given <i>key</i> when found. Returns true if the key is found otherwise false is returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.remove("a");
     *   // false
     * }
     * ```
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.put("a", 1);
     *
     *   await cache.remove("a");
     *   // true
     * }
     * ```
     */
    remove(key: string): LazyPromise<boolean>;

    /**
     * The <i>removeMany</i> method removes keys. Returns true for the keys that are removed otherwise false is returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.removeMany(["a"]);
     *   // false
     * }
     * ```
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.put("a", 1);
     *
     *   await cache.removeMany(["a"]);
     *   // { a: true }
     * }
     * ```
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>>;

    /**
     * The <i>getAndRemove</i> method removes the given <i>key</i> and returns it when found otherwise null will be returned.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getAndRemove("a");
     *   // null
     *
     *   await cache.put("a", 1)
     *
     *   await cache.getAndRemove("a");
     *   // "a"
     *
     *   await cache.get("a");
     *   // null
     * }
     * ```
     */
    getAndRemove(key: string): LazyPromise<TType | null>;

    /**
     * The <i>getOrAdd</i> method will retrieve the given <i>key</i> if found otherwise <i>valueToAdd</i> will be added and returned.
     * The <i>valueToAdd<i> can be async or sync function.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOrAdd("a", 1);
     *   // 1
     * }
     * ```
     * You can pass a function as default value.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOrAdd("a", () => -1);
     *   // -1
     * }
     * ```
     * You can pass an async function as default value.
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.getOrAdd("a", async () => -1);
     *   // -1
     * }
     * ```
     * You can pass an <i>{@link LazyPromise}</i> as default value.
     * @example
     * ```ts
     * import type { ICache, IAsyncCollection } from "@daiso-tech/core";
     *
     * type IPerson = {
     *   name: string;
     *   age: number;
     * };
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache, collection: IAsyncCollection<IPerson>): Promise<void> {
     *   await cache.getOrAdd("a", collection.first(person => person.name === "a"));
     * }
     * ```
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
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.increment("a", 1);
     *   // false
     *
     *   await cache.put("a", 1);
     *
     *   await cache.increment("a", 1);
     *   // true
     *
     *   await cache.get("a");
     *   // 2
     * }
     * ```
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
     * @example
     * ```ts
     * import type { ICache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty
     * async function main(cache: ICache): Promise<void> {
     *   await cache.decrement("a", 1);
     *   // false
     *
     *   await cache.put("a", 1);
     *
     *   await cache.decrement("a", 1);
     *   // true
     *
     *   await cache.get("a");
     *   // 0
     * }
     * ```
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
     * @example
     * ```ts
     * import type { IGroupableCache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty and the default rootGroup is "@global"
     * async function main(cache: IGroupableCache): Promise<void> {
     *   console.log(cache.getGroup())
     *
     *   const cacheA = cache.withGroup("a");
     *
     *   // Will be "@global/a"
     *   console.log(cacheA.getGroup())
     * }
     * ```
     */
    getGroup(): string;
};

/**
 * The <i>IGroupableCache</i> contract defines a way for storing data as key-value pairs independent of data storage.
 * It commes with one extra method which is useful for multitennat applications compared to <i>{@link ICache}</i>.
 * @group Contracts
 */
export type IGroupableCache<TType = unknown> = ICache<TType> & {
    /**
     * The <i>withGroup</i> method returns a new <i>{@link ICache}</i> instance that groups keys together.
     * Only keys in the same group will be updated, removed, or retrieved, leaving keys outside the group unaffected.
     * This useful for multitennat applications.
     * @example
     * ```ts
     * import type { IGroupableCache } from "@daiso-tech/core";
     *
     * // Asume the inputed cache is empty and the default rootGroup is "@global"
     * async function main(cache: IGroupableCache): Promise<void> {
     *   const cacheA = cache.withGroup("a");
     *   await cacheA.add("a", 1);
     *
     *   const cacheB = cache.withGroup("b");
     *   await cacheB.add("b", 2);
     *
     *   // Will print { a: 1, b: null }
     *   console.log(await cacheA.getMany(["a", "b"]));
     *
     *   // Will print { a: nullp, b: 2 }
     *   console.log(await cacheB.getMany(["a", "b"]));
     * }
     * ```
     */
    withGroup(group: OneOrMore<string>): ICache<TType>;
};

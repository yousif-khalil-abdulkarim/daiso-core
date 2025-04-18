/**
 * @module Cache
 */
import type { TimeSpan } from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TypeCacheError } from "@/cache/contracts/cache.errors.js";

/**
 * The `ICacheAdapter` contract defines a way for key-value pairs independent of data storage.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheAdapter<TType = unknown> = {
    /**
     * The `get` method returns the value when `key` is found otherwise null will be returned.
     */
    get(key: string): PromiseLike<TType | null>;

    /**
     * The `getAndRemove` method returns the value when `key` is found otherwise null will be returned.
     * The key will be removed after it is returned.
     */
    getAndRemove(key: string): PromiseLike<TType | null>;

    /**
     * The `add` method adds a `key` with given `value` when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * You can provide a `ttl` value. If null is passed, the item will not expire.
     */
    add(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean>;

    /**
     * The `put` method replaces th given `key` with the given `value` and `ttl` if the `key` exists othwerwise it will add the given `value` and `ttl`.
     * Returns true if the `key` where replaced otherwise false is returned.
     */
    put(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean>;

    /**
     * The `update` method updates the given `key` with given `value`. Returns true if the `key` where updated otherwise false will be returned.
     */
    update(key: string, value: TType): PromiseLike<boolean>;

    /**
     * The `increment` method increments the given `key` with given `value`. Returns true if the `key` where incremented otherwise false will be returned.
     * If `values` is not defined then it will increment the key with 1.
     * An error will thrown if the key is not a number.
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment(key: string, value: number): PromiseLike<boolean>;

    /**
     * The `removeMany` method removes many keys. Returns true if one of the keys where deleted otherwise false is returned.
     */
    removeMany(keys: string[]): PromiseLike<boolean>;

    /**
     * The `removeAll` method removes all keys from the cache.
     */
    removeAll(): PromiseLike<void>;

    /**
     * The `removeByKeyPrefix` method removes all the keys in the cache that starts with the given `prefix`.
     */
    removeByKeyPrefix(prefix: string): PromiseLike<void>;
};

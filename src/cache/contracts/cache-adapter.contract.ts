/**
 * @module Cache
 */
import type { TimeSpan } from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TypeCacheError } from "@/cache/contracts/cache.errors.js";

/**
 * The <i>ICacheAdapter</i> contract defines a way for key-value pairs independent of data storage.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheAdapter<TType = unknown> = {
    /**
     * The <i>get</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     */
    get(key: string): PromiseLike<TType | null>;

    /**
     * The <i>getAndRemove</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     * The key will be removed after it is returned.
     */
    getAndRemove(key: string): PromiseLike<TType | null>;

    /**
     * The <i>add</i> method adds a <i>key</i> with given <i>value</i> when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * You can provide a <i>ttl</i> value. If null is passed, the item will not expire.
     */
    add(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean>;

    /**
     * The <i>put</i> method replaces th given <i>key</i> with the given <i>value</i> and <i>ttl</i> if the <i>key</i> exists othwerwise it will add the given <i>value</i> and <i>ttl</i>.
     * Returns true if the <i>key</i> where replaced otherwise false is returned.
     */
    put(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean>;

    /**
     * The <i>update</i> method updates the given <i>key</i> with given <i>value</i>. Returns true if the <i>key</i> where updated otherwise false will be returned.
     */
    update(key: string, value: TType): PromiseLike<boolean>;

    /**
     * The <i>increment</i> method increments the given <i>key</i> with given <i>value</i>. Returns true if the <i>key</i> where incremented otherwise false will be returned.
     * If <i>values</i> is not defined then it will increment the key with 1.
     * An error will thrown if the key is not a number.
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment(key: string, value: number): PromiseLike<boolean>;

    /**
     * The <i>removeMany</i> method removes many keys. Returns true if one of the keys where deleted otherwise false is returned.
     */
    removeMany(keys: string[]): PromiseLike<boolean>;

    /**
     * The <i>removeByKeyPrefix</i> method removes all the keys in the cache that starts with the given <i>prefix</i>.
     */
    removeByKeyPrefix(prefix: string): PromiseLike<void>;
};

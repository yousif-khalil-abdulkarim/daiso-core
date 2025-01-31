/**
 * @module Cache
 */

import type { TimeSpan } from "@/utilities/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCacheError,
} from "@/cache/contracts/cache.errors";

/**
 * The <i>ICacheAdapter</i> contract defines a way for storing data as key-value pairs independent of data storage.
 * This interface is not meant to be used directly, instead you should use <i>ICache</i>
 * @group Contracts
 */
export type ICacheAdapter<TType = unknown> = {
    /**
     * The <i>get</i> returns the <i>key</i> value if found otherwise null will be returned.
     */
    get(key: string): PromiseLike<TType | null>;

    /**
     * The <i>add</i> method add a new <i>key</i>. Returns true if the <i>key</i> where added otherwise false will be returned.
     * You must provide a <i>ttl</i> value. If null is passed, the item will not expire.
     */
    add(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean>;

    /**
     * The <i>update</i> method updates a <i>key</i>. Returns true if the <i>key</i> where updated otherwise false will be returned.
     */
    update(key: string, value: TType): PromiseLike<boolean>;

    /**
     * The <i>put</i> method replaces a <i>key</i> if the <i>key</i> exists including the ttl value or adds <i>key</i> that do not exists with a given <i>ttl</i>.
     * Returns true if the <i>key</i> where replaced otherwise false is returned.
     * You must provide a <i>ttl</i> value. If null is passed, the item will not expire.
     */
    put(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean>;

    /**
     * The <i>remove</i> method removes a <i>key</i>. Returns true if the <i>key</i> is removed otherwise false is returned.
     */
    remove(key: string): PromiseLike<boolean>;

    /**
     * The <i>increment</i> method will increment the given <i>key</i> if found otherwise nonthing will occur.
     * Returns true if key is incremented otherwise false will be returned.
     * An error will thrown if the key is not a number.
     * @throws {TypeCacheError} {@link TypeCacheError}
     */
    increment(key: string, value: number): PromiseLike<boolean>;

    /**
     * The <i>clear</i> method removes all keys that starts <i>prefix</i>.
     */
    clear(): PromiseLike<void>;

    /**
     * The <i>getGroup</i> method returns the group name.
     */
    getGroup(): string;

    /**
     * The <i>withGroup</i> method returns a new <i>{@link ICacheAdapter}</i> instance that groups keys together.
     * Only keys in the group can be updated, removed, or retrieved, leaving keys outside the group unaffected.
     */
    withGroup(group: string): ICacheAdapter<TType>;
};

/**
 * @module Cache
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheData<TType = unknown> = {
    value: TType;
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheDataExpiration = {
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheInsert<TType = unknown> = {
    key: string;
    value: TType;
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type ICacheUpdate<TType = unknown> = {
    key: string;
    value: TType;
};

/**
 * The <i>IDatabaseCacheAdapter</i> contract defines a way for as key-value pairs independent of data storage.
 * This contract simplifies the implementation of cache adapters with CRUD-based databases, such as SQL databases and ORMs like TypeOrm and MikroOrm.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Contracts
 */
export type IDatabaseCacheAdapter<TType = unknown> = {
    /**
     * The <i>find</i> method returns the the <i>key</i> data which includs <i>{@link ICacheData}.value</i> and <i>{@link ICacheData}.expiration</i>.
     */
    find(key: string): PromiseLike<ICacheData<TType> | null>;

    /**
     * The <i>insert</i> method inserts the given cache <i>data</i>.
     */
    insert(data: ICacheInsert<TType>): PromiseLike<void>;

    /**
     * The <i>upsert</i> method inserts a key and if the key already exists then key will be updated with new <i>data.value</i> and <i>data.expiration</i>.
     * The method always returns the old cache data if it exists otherwise null will be returned.
     */
    upsert(data: ICacheInsert<TType>): PromiseLike<ICacheDataExpiration | null>;

    /**
     * The <i>removeExpiredMany</i> method updates a expired <i>key</i>.
     */
    updateExpired(data: ICacheInsert<TType>): PromiseLike<number>;

    /**
     * The <i>removeExpiredMany</i> method updates a unexpired <i>key</i>.
     */
    updateUnexpired(data: ICacheUpdate<TType>): PromiseLike<number>;

    /**
     * The <i>incrementUnexpired</i> should always throw an error if the existing item is not a number type.
     */
    incrementUnexpired(data: ICacheUpdate<number>): PromiseLike<number>;

    /**
     * The <i>removeExpiredMany</i> method removes multiple expired <i>keys</i>.
     */
    removeExpiredMany(keys: string[]): PromiseLike<number>;

    /**
     * The <i>removeExpiredMany</i> method removes multiple unexpired <i>keys</i>.
     */
    removeUnexpiredMany(keys: string[]): PromiseLike<number>;

    /**
     * The <i>removeAll</i> method removes all keys from the cache.
     */
    removeAll(): PromiseLike<void>;

    /**
     * The <i>removeByKeyPrefix</i> method removes all the keys in the cache that starts with the given <i>prefix</i>.
     */
    removeByKeyPrefix(prefix: string): PromiseLike<void>;
};

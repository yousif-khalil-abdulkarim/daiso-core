/**
 * @module Cache
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheData<TType = unknown> = {
    value: TType;
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheDataExpiration = {
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheInsert<TType = unknown> = {
    key: string;
    value: TType;
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type ICacheUpdate<TType = unknown> = {
    key: string;
    value: TType;
};

/**
 * The `IDatabaseCacheAdapter` contract defines a way for as key-value pairs independent of data storage.
 * This contract simplifies the implementation of cache adapters with CRUD-based databases, such as SQL databases and ORMs like TypeOrm and MikroOrm.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Contracts
 */
export type IDatabaseCacheAdapter<TType = unknown> = {
    /**
     * The `find` method returns the the `key` data which includs `{@link ICacheData}.value` and `{@link ICacheData}.expiration`.
     */
    find(key: string): PromiseLike<ICacheData<TType> | null>;

    /**
     * The `insert` method inserts the given cache `data`.
     */
    insert(data: ICacheInsert<TType>): PromiseLike<void>;

    /**
     * The `upsert` method inserts a key and if the key already exists then key will be updated with new `data.value` and `data.expiration`.
     * The method always returns the old cache data if it exists otherwise null will be returned.
     */
    upsert(data: ICacheInsert<TType>): PromiseLike<ICacheDataExpiration | null>;

    /**
     * The `removeExpiredMany` method updates a expired `key`.
     */
    updateExpired(data: ICacheInsert<TType>): PromiseLike<number>;

    /**
     * The `removeExpiredMany` method updates a unexpired `key`.
     */
    updateUnexpired(data: ICacheUpdate<TType>): PromiseLike<number>;

    /**
     * The `incrementUnexpired` should always throw an error if the existing item is not a number type.
     */
    incrementUnexpired(data: ICacheUpdate<number>): PromiseLike<number>;

    /**
     * The `removeExpiredMany` method removes multiple expired `keys`.
     */
    removeExpiredMany(keys: string[]): PromiseLike<number>;

    /**
     * The `removeExpiredMany` method removes multiple unexpired `keys`.
     */
    removeUnexpiredMany(keys: string[]): PromiseLike<number>;

    /**
     * The `removeAll` method removes all keys from the cache.
     */
    removeAll(): PromiseLike<void>;

    /**
     * The `removeByKeyPrefix` method removes all the keys in the cache that starts with the given `prefix`.
     */
    removeByKeyPrefix(prefix: string): PromiseLike<void>;
};

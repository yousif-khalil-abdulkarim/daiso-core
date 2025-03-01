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
    find(key: string): PromiseLike<ICacheData<TType> | null>;

    insert(data: ICacheInsert<TType>): PromiseLike<void>;

    /**
     * The <i>upsert</i> method inserts a key and if the key already exists then key will be updated with new <i>data.value</i> and <i>data.expiration</i>.
     * The method always returns the old cache data if it exists otherwise null will be returned.
     */
    upsert(data: ICacheInsert<TType>): PromiseLike<ICacheDataExpiration | null>;

    updateExpired(data: ICacheInsert<TType>): PromiseLike<number>;

    updateUnexpired(data: ICacheUpdate<TType>): PromiseLike<number>;

    /**
     * The <i>incrementUnexpired</i> should always throw an error if the existing item is not a number type.
     */
    incrementUnexpired(data: ICacheUpdate<number>): PromiseLike<number>;

    removeExpiredMany(keys: string[]): PromiseLike<number>;

    removeUnexpiredMany(keys: string[]): PromiseLike<number>;

    removeByKeyPrefix(prefix: string): PromiseLike<void>;
};

/**
 * @module Lock
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockData = {
    owner: string;
    expiration: Date | null;
};

/**
 * The `IDatabaseLockAdapter` contract defines a way for managing locks independent of data storage.
 * This contract simplifies the implementation of lock adapters with CRUD-based databases, such as SQL databases and ORMs like TypeOrm and MikroOrm.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type IDatabaseLockAdapter = {
    /**
     * The `insert` method will create a lock if it does not exist and if the lock already exists an error must be thrown.
     */
    insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<void>;

    /**
     * The `update` method will update a lock if it has expired, matches the given `key` and  matches the given `owner`.
     *
     * @returns Returns number of updated rows or documents.
     */
    update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<number>;

    /**
     * The `remove` method will remove a lock if it matches the given `key` and matches the given `owner`.
     */
    remove(key: string, owner: string | null): PromiseLike<void>;

    /**
     * The `refresh` method will upadte expiration of lock if it matches the given `key` and matches the given `owner`.
     *
     * @returns Returns number of updated rows or documents.
     */
    refresh(key: string, owner: string, expiration: Date): PromiseLike<number>;

    /**
     * The `find` method will return a lock by the given `key`.
     */
    find(key: string): PromiseLike<ILockData | null>;
};

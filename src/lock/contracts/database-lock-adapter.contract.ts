/**
 * @module Lock
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockExpirationData = {
    /**
     * The expiration date and time of the lock.
     * `null` indicates the lock does not expire.
     */
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockData = ILockExpirationData & {
    /**
     * The identifier of the entity currently holding the lock.
     */
    owner: string;
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
     * Inserts a new lock into the database.
     *
     * @param key The unique identifier for the lock.
     * @param owner The identifier of the entity acquiring the lock.
     * @param expiration The date and time when the lock should expire. Use `null` for a lock that doesn't expire.
     */
    insert(key: string, owner: string, expiration: Date | null): Promise<void>;

    /**
     * Conditionally renews the lock on `key` if it has already expired, setting a new `owner` and `expiration`.
     * Note you need to check if the expiration field is not null and greater than or equal to current time.
     *
     * @param key The unique identifier for the lock.
     * @param owner The new identifier for the entity acquiring the lock.
     * @param expiration The new date and time when the lock should expire. Use `null` for a lock that doesn't expire.
     * @returns Returns number of updated.
     */
    updateIfExpired(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<number>;

    /**
     * Removes a lock from the database regardless of its owner.
     *
     * @param key The unique identifier for the lock to remove.
     */
    remove(key: string): Promise<ILockExpirationData | null>;

    /**
     * Removes a lock from the database only if it is currently held by the specified owner.
     *
     * @param key The unique identifier for the lock.
     * @param owner The identifier of the expected owner.
     * @returns Returns {@link ILockExpirationData |`ILockExpirationData | null`}. The {@link ILockExpirationData |`ILockExpirationData`} data if successfully removed, otherwise `null` if the lock wasn't found or the owner didn't match.
     */
    removeIfOwner(key: string, owner: string): Promise<ILockData | null>;

    /**
     * Updates the expiration date of a lock if it is currently held by the specified owner.
     *
     * @param key The unique identifier for the lock.
     * @param owner The identifier of the expected owner.
     * @param expiration The new date and time when the lock should expire.
     * @returns Returns a number greater than or equal to `1` if the lock's expiration was updated, or `0` if the lock wasn't found or the owner didn't match.
     */
    updateExpirationIfOwner(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number>;

    /**
     * Retrieves the current lock data for a given key.
     *
     * @param key The unique identifier for the lock.
     * @returns Returns the lock's owner and expiration data if found, otherwise `null`.
     */
    find(key: string): Promise<ILockData | null>;
};

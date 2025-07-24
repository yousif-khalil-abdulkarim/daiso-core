---
"@daiso-tech/core": minor
---

Updated `IDatabaseLockAdapter` contract:

Before update:

```ts
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
```

After update:

```ts
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
     * @returns Returns a number greater than or equal to `1` if the lock was successfully updated because it was expired, or `0` if the lock was not updated (e.g., it was not expired or did not exist).
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
    remove(key: string): Promise<void>;

    /**
     * Removes a lock from the database only if it is currently held by the specified owner.
     *
     * @param key The unique identifier for the lock.
     * @param owner The identifier of the expected owner.
     * @returns A promise that resolves to {@link ILockExpirationData |`ILockExpirationData | null`}. Returns the lock's expiration data if successfully removed, otherwise `null` if the lock wasn't found or the owner didn't match.
     */
    removeIfOwner(
        key: string,
        owner: string,
    ): Promise<ILockExpirationData | null>;

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
```

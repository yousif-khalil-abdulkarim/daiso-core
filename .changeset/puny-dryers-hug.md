---
"@daiso-tech/core": minor
---

Update the `ILockAdapter` contract.

before:

```ts
export type ILockAdapter = {
    /**
     * The `acquire` method acquires a lock only if the lock is not acquired.
     *
     * @returns Returns true if lock is not already acquired or false.
     */
    acquire(key: string, owner: string, ttl: TimeSpan | null): Promise<boolean>;

    /**
     * The `release` method releases a lock if the owner matches.
     *
     * @returns Returns true if released otherwise false is returned.
     */
    release(key: string, owner: string): Promise<boolean>;

    /**
     * The `forceRelease` method releases a lock regardless of the owner.
     *
     * @returns Returns true if the lock exists or false if the lock doesnt exists.
     */
    forceRelease(key: string): Promise<boolean>;

    /**
     * The `refresh` method will upadte `ttl` of lock if it matches the given `key`, given `owner` and is expireable.
     * @returns
     * - {@link LOCK_REFRESH_RESULT.UNOWNED_REFRESH | `LOCK_REFRESH_RESULT.UNOWNED_REFRESH`}: The lock doesn't exist or is owned by a different owner.
     * - {@link LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY | `LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY`}: The lock is owned by the same owner but cannot be refreshed because it's unexpirable.
     * - {@link LOCK_REFRESH_RESULT.REFRESHED | `LOCK_REFRESH_RESULT.REFRESHED`}: The lock is owned by the same owner and its ttl has been updated.
     */
    refresh(
        key: string,
        owner: string,
        ttl: TimeSpan,
    ): Promise<LockRefreshResult>;
};
```

after:

```ts
export type ILockAdapter = {
    /**
     * The `acquire` method acquires a lock only if expired.
     *
     * @returns Returns `true` if expired otherwise `false` is returned.
     */
    acquire(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean>;

    /**
     * The `release` method releases a lock if the owner matches.
     *
     * @returns Returns `true` if released otherwise `false` is returned.
     */
    release(key: string, lockId: string): Promise<boolean>;

    /**
     * The `forceRelease` method releases a lock regardless of the owner.
     *
     * @returns Returns `true` if the lock exists or `false` if the lock is expired.
     */
    forceRelease(key: string): Promise<boolean>;

    /**
     * The `refresh` method will upadte `ttl` of lock if it matches the `owner` and is expireable.
     *
     * @returns Returns `false` if the lock is unexpireable, the is expired, does not match the `owner` otherwise `true` is returned.
     */
    refresh(key: string, lockId: string, ttl: TimeSpan): Promise<boolean>;

    getState(key: string): Promise<ILockAdapterState | null>;
};
```

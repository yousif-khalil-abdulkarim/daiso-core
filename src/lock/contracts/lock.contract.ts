/**
 * @module Lock
 */

import type {
    AsyncLazy,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Invokable,
    Result,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    KeyAlreadyAcquiredLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnownedReleaseLockError,
} from "@/lock/contracts/lock.errors.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type AquireBlockingSettings = { time?: TimeSpan; interval?: TimeSpan };

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILock = {
    /**
     * The `run` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquire` and `release` method.
     */
    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>>;

    /**
     * The `runOrFail` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireOrFail` and `release` method.
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): LazyPromise<TValue>;

    /**
     * The `runBlocking` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireBlocking` and `release` method.
     */
    runBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: AquireBlockingSettings,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>>;

    /**
     * The `runBlockingOrFail` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireBlockingOrFail` and `release` method.
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: AquireBlockingSettings,
    ): LazyPromise<TValue>;

    /**
     * The `acquire` method acquires a lock only if the lock is not already acquired.
     *
     * @returns true if the lock is already acquired otherwise false is returned.
     */
    acquire(): LazyPromise<boolean>;

    /**
     * The `acquireBlocking` method acquires a lock only if the lock is not already acquired.
     * If the lock is acquired, it retries every `settings.interval` until `settings.time` is reached.
     *
     * @returns true if the lock is already acquired otherwise false is returned.
     */
    acquireBlocking(settings?: AquireBlockingSettings): LazyPromise<boolean>;

    /**
     * The `acquireBlockingOrFail` method acquires a lock only if the lock is not already acquired.
     * If the lock is acquired, it retries every `settings.interval` until `settings.time` is reached.
     * Throws an error if not lock cannot be acquired after the given `settings.time`.
     *
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    acquireBlockingOrFail(settings?: AquireBlockingSettings): LazyPromise<void>;

    /**
     * The `acquireOrFail` method acquires a lock only if the lock is not already acquired.
     * Throws an error if already acquired.
     *
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    acquireOrFail(): LazyPromise<void>;

    /**
     * The `release` method releases a lock if owned by the same owner.
     *
     * @returns true if the lock is released otherwise false is returned.
     */
    release(): LazyPromise<boolean>;

    /**
     * The `releaseOrFail` method releases a lock if owned by the same owner.
     * Throws an error if a different owner attempts to release the lock.
     *
     * @throws {UnownedReleaseLockError} {@link UnownedReleaseLockError}
     */
    releaseOrFail(): LazyPromise<void>;

    /**
     * The `forceRelease` method releases a lock regardless of the owner.
     */
    forceRelease(): LazyPromise<void>;

    /**
     * The `isExpired` method returns true if the expired otherwise false is returned.
     */
    isExpired(): LazyPromise<boolean>;

    /**
     * The `isLocked` method returns true if the locked otherwise false is returned.
     */
    isLocked(): LazyPromise<boolean>;

    /**
     * The `refresh` method updates the TTL of the lock if owned by the same owner.
     *
     * @returns true if the lock is refreshed occurs otherwise false is returned.
     */

    refresh(ttl?: TimeSpan): LazyPromise<boolean>;

    /**
     * The `refreshOrFail` method updates the TTL of the lock if owned by the same owner.
     * Throws an error if a different owner attempts to refresh the lock.
     * @throws {UnownedRefreshLockError} {@link UnownedRefreshLockError}
     */
    refreshOrFail(ttl?: TimeSpan): LazyPromise<void>;

    /**
     * The `getRemainingTime` return the reaming time as {@link TimeSpan | `TimeSpan`}.
     *
     * @returns null if the key doesnt exist, key has no expiration and key has expired.
     */
    getRemainingTime(): LazyPromise<TimeSpan | null>;

    /**
     * The `getOwner` method return the current owner.
     */
    getOwner(): LazyPromise<string>;
};

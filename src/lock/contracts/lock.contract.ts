/**
 * @module Lock
 */

import type {
    LazyPromiseable,
    Result,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToAquireLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToReleaseLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    KeyAlreadyAcquiredLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnownedReleaseLockError,
} from "@/lock/contracts/lock.errors.js";
import type { IEventListenable } from "@/event-bus/contracts/_module-exports.js";
import type { LockEvents } from "@/lock/contracts/lock.events.js";

/**
 * The <i>ILockListener</i> contract defines a way for listening <i>{@link ILock}</i> operations.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Contracts
 */
export type ILockListener = IEventListenable<LockEvents>;

export type AquireBlockingSettings = {
    time?: TimeSpan;
    interval?: TimeSpan;
};
/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Contracts
 */
export type ILock = ILockListener & {
    /**
     * The <i>run</i> method wraps an async function or <i>{@link LazyPromise}</i> with the <i>acquire</i> and <i>release</i> method.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     */
    run<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>>;

    /**
     * The <i>runOrFail</i> method wraps an async function or <i>{@link LazyPromise}</i> with the <i>acquireOrFail</i> and <i>release</i> method.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    runOrFail<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<TValue>;

    /**
     * The <i>runBlocking</i> method wraps an async function or <i>{@link LazyPromise}</i> with the <i>acquireBlocking</i> and <i>release</i> method.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     */
    runBlocking<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
        settings?: AquireBlockingSettings,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>>;

    /**
     * The <i>acquire</i> method acquires a lock only if the lock is not already acquired.
     * Returns true if the lock is acquired otherwise false is returned.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     */
    acquire(): LazyPromise<boolean>;

    /**
     * The <i>acquireBlocking</i> method acquires a lock only if the lock is not already acquired.
     * If the lock is acquired, it retries every <i>settings.interval</i> until <i>settings.time</i> is reached.
     * Returns true if the lock is acquired otherwise false is returned.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     */
    acquireBlocking(settings?: AquireBlockingSettings): LazyPromise<boolean>;

    /**
     * The <i>acquireOrFail</i> method acquires a lock only if the lock is not already acquired.
     * Throws an error if already acquired.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    acquireOrFail(): LazyPromise<void>;

    /**
     * The <i>release</i> method releases a lock if owned by the same owner.
     * Returns true if the lock is released otherwise false is returned.
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     */
    release(): LazyPromise<boolean>;

    /**
     * The <i>releaseOrFail</i> method releases a lock if owned by the same owner.
     * Throws an error if a different owner attempts to release the lock.
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     * @throws {UnownedReleaseLockError} {@link UnownedReleaseLockError}
     */
    releaseOrFail(): LazyPromise<void>;

    /**
     * The <i>forceRelease</i> method releases a lock regardless of the owner.
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     */
    forceRelease(): LazyPromise<void>;

    /**
     * The <i>isExpired</i> method returns true if the expired otherwise false is returned.
     */
    isExpired(): LazyPromise<boolean>;

    /**
     * The <i>isLocked</i> method returns true if the locked otherwise false is returned.
     */
    isLocked(): LazyPromise<boolean>;

    /**
     * The <i>refresh</i> method updates the TTL of the lock if owned by the same owner.
     * Returns true if the lock is refreshed occurs otherwise false is returned.
     */
    refresh(ttl?: TimeSpan): LazyPromise<boolean>;

    /**
     * The <i>refreshOrFail</i> method updates the TTL of the lock if owned by the same owner.
     * Throws an error if a different owner attempts to refresh the lock.
     * @throws {UnownedRefreshLockError} {@link UnownedRefreshLockError}
     */
    refreshOrFail(ttl?: TimeSpan): LazyPromise<void>;

    /**
     * The <i>getRemainingTime</i> return the reaming time as <i>{@link TimeSpan}</i>.
     * Returns null if the key doesnt exist, key has no expiration and key has expired.
     */
    getRemainingTime(): LazyPromise<TimeSpan | null>;

    /**
     * The <i>getOwner</i> method return the current owner.
     */
    getOwner(): LazyPromise<string>;
};

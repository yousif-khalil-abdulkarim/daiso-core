/**
 * @module Lock
 */

import type { LazyPromiseable, Result, TimeSpan } from "@/utilities/_module";
import type { LazyPromise } from "@/async/_module";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToAquireLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToReleaseLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    KeyAlreadyAcquiredLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnownedReleaseLockError,
} from "@/lock/contracts/lock.errors";
import type { IEventListener } from "@/event-bus/contracts/_module";
import type { LockEvents } from "@/lock/contracts/lock.events";

/**
 * The <i>ILockListener</i> contract defines a way for listening <i>{@link ILock}</i> crud operations.
 * @group Contracts
 */
export type ILockListener = IEventListener<LockEvents>;

/**
 * @group Contracts
 */
export type ILock = ILockListener & {
    /**
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     */
    run<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>>;

    /**
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    runOrFail<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<TValue>;

    /**
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     */
    acquire(): LazyPromise<boolean>;

    /**
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     */
    acquireOrFail(): LazyPromise<void>;

    /**
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     */
    release(): LazyPromise<boolean>;

    /**
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     * @throws {UnownedReleaseLockError} {@link UnownedReleaseLockError}
     */
    releaseOrFail(): LazyPromise<void>;

    /**
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     */
    forceRelease(): LazyPromise<void>;

    isExpired(): LazyPromise<boolean>;

    isLocked(): LazyPromise<boolean>;

    refresh(ttl?: TimeSpan): LazyPromise<boolean>;

    /**
     * @throws {UnownedExtendLockError} {@link UnownedExtendLockError}
     */
    refreshOrFail(ttl?: TimeSpan): LazyPromise<void>;

    getRemainingTime(): LazyPromise<TimeSpan | null>;

    getOwner(): LazyPromise<string>;
};

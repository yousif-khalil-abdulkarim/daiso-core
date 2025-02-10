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
 * The <i>ILockListener</i> contract defines a way for listening <i>{@link ILock}</i> operations.
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
     * @example
     * ```ts
     * import { type ILock, TimeSpan } from "@daiso-tech/core";
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   await lock.run(async () => {
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   });
     * }
     * ```
     * You can also pass in a <i>{@link LazyPromise}</i>.
     * @example
     * ```ts
     * import { type ILock, TimeSpan } from "@daiso-tech/core";
     *
     * function fn(): LazyPromise<void> {
     *   return new LazyPromise(async () => {
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   });
     * }
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   await lock.run(fn());
     * }
     * ```
     */
    run<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>>;

    /**
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     * @example
     * ```ts
     * import { type ILock, TimeSpan } from "@daiso-tech/core";
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   await lock.runOrFail(async () => {
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   });
     * }
     * ```
     * You can also pass in a <i>{@link LazyPromise}</i>.
     * @example
     * ```ts
     * import { type ILock, TimeSpan } from "@daiso-tech/core";
     *
     * function fn(): LazyPromise<void> {
     *   return new LazyPromise(async () => {
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   });
     * }
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   await lock.runOrFail(fn());
     * }
     * ```
     */
    runOrFail<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<TValue>;

    /**
     * The <i>acquire</i> method acquires a lock only if the lock is not already acquired.
     * Throws an error if a different owner attempts to release the lock.
     * Returns true if the lock is acquired otherwise true is returned.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @example
     * ```ts
     * import { type ILock, TimeSpan } from "@daiso-tech/core";
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   try {
     *     await lock.acquire();
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   }
     *   finally {
     *     await lock.release();
     *   }
     * }
     * ```
     */
    acquire(): LazyPromise<boolean>;

    /**
     * The <i>acquireOrFail</i> method acquires a lock only if the lock is not already acquired.
     * Throws an error if already acquired.
     * @throws {UnableToAquireLockError} {@link UnableToAquireLockError}
     * @throws {KeyAlreadyAcquiredLockError} {@link KeyAlreadyAcquiredLockError}
     * @example
     * ```ts
     * import type { ILock, TimeSpan } from "@daiso-tech/core";
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   try {
     *     await lock.acquireOrFail();
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   }
     *   finally {
     *     await lock.releaseOrFail();
     *   }
     * }
     * ```
     */
    acquireOrFail(): LazyPromise<void>;

    /**
     * The <i>release</i> method releases a lock if owned by the same owner.
     * Returns true if the lock is released otherwise false is returned.
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     * @example
     * ```ts
     * import type { ILock, TimeSpan } from "@daiso-tech/core";
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   try {
     *     await lock.acquire();
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   }
     *   finally {
     *     await lock.release();
     *   }
     * }
     * ```
     */
    release(): LazyPromise<boolean>;

    /**
     * The <i>releaseOrFail</i> method releases a lock if owned by the same owner.
     * Throws an error if a different owner attempts to release the lock.
     * @throws {UnableToReleaseLockError} {@link UnableToReleaseLockError}
     * @throws {UnownedReleaseLockError} {@link UnownedReleaseLockError}
     * @example
     * ```ts
     * import type { ILock, TimeSpan } from "@daiso-tech/core";
     *
     * // The function will execute sequentially when called concurrently as long you use the same lock.
     * async function main(lock: ILock): Promise<void> {
     *   try {
     *     await lock.acquireOrFail();
     *     console.log("1.");
     *     await delay(TimeSpan.fromMilliseconds(1));
     *     console.log("2.");
     *   }
     *   finally {
     *     await lock.releaseOrFail();
     *   }
     * }
     * ```
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

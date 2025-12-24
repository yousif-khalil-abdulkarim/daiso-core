/**
 * @module Lock
 */

import type {
    AsyncLazy,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Invokable,
} from "@/utilities/_module.js";
import type { Task } from "@/task/_module.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedAcquireLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedReleaseLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedRefreshLockError,
} from "@/lock/contracts/lock.errors.js";
import type { ILockState } from "@/lock/contracts/lock-state.contract.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type LockAquireBlockingSettings = {
    time?: ITimeSpan;
    interval?: ITimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockStateMethods = {
    getState(): Task<ILockState>;

    /**
     * The `key` of the `ILock` instance.
     */
    readonly key: string;

    /**
     * The `id` of the `ILock` instance.
     */
    readonly id: string;

    /**
     * The `ttl` of `ILock` instance.
     */
    readonly ttl: ITimeSpan | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockBase = {
    /**
     * The `runOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireOrFail` and `release` method.
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue>;

    /**
     * The `runBlockingOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireBlockingOrFail` and `release` method.
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: LockAquireBlockingSettings,
    ): Task<TValue>;

    /**
     * The `acquire` method acquires a lock only if the key is not already acquired by different owner.
     *
     * @returns Returns true if the lock is not already acquired otherwise false is returned.
     */
    acquire(): Task<boolean>;

    /**
     * The `acquireOrFail` method acquires a lock only if the key is not already acquired by different owner.
     * Throws an error if the lock is already acquired by different owner.
     *
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    acquireOrFail(): Task<void>;

    /**
     * The `acquireBlocking` method acquires a lock only if the key is not already acquired by different owner.
     * If the lock is not acquired, it retries every `settings.interval` until `settings.time` is reached.
     *
     * @returns Returns true if the lock is not already acquired otherwise false is returned.
     */
    acquireBlocking(settings?: LockAquireBlockingSettings): Task<boolean>;

    /**
     * The `acquireBlockingOrFail` method acquires a lock only if the key is not already acquired by different owner.
     * If the lock is not acquired, it retries every `settings.interval` until `settings.time` is reached.
     * Throws an error if the lock is already acquired by different owner.
     *
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    acquireBlockingOrFail(settings?: LockAquireBlockingSettings): Task<void>;

    /**
     * The `release` method releases a lock if owned by the same owner.
     *
     * @returns Returns true if the lock is released otherwise false is returned.
     */
    release(): Task<boolean>;

    /**
     * The `releaseOrFail` method releases a lock if owned by the same owner.
     * Throws an error if the lock is not owned by same owner.
     *
     * @throws {FailedReleaseLockError} {@link FailedReleaseLockError}
     */
    releaseOrFail(): Task<void>;

    /**
     * The `forceRelease` method releases a lock regardless of the owner.
     *
     * @returns Returns true if the lock exists or false if the lock doesnt exists.
     */
    forceRelease(): Task<boolean>;

    /**
     * The `refresh` method updates the `ttl` of the lock if expireable and owned by the same owner.
     *
     * @returns Returns true if the lock is refreshed otherwise false is returned.
     */
    refresh(ttl?: ITimeSpan): Task<boolean>;

    /**
     * The `refreshOrFail` method updates the `ttl` of the lock if expireable and owned by the same owner.
     * Throws an error if the lock is not owned by same owner.
     * Throws an error if the key is unexpirable.
     *
     * @throws {FailedRefreshLockError} {@link FailedRefreshLockError}
     */
    refreshOrFail(ttl?: ITimeSpan): Task<void>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILock = ILockBase & ILockStateMethods;

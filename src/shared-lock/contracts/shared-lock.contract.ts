/**
 * @module SharedLock
 */

import type { Task } from "@/task/_module-exports.js";
import type { AsyncLazy, Result } from "@/utilities/_module-exports.js";
import type {
    LimitReachedReaderSemaphoreError,
    FailedAcquireWriterLockError,
} from "@/shared-lock/contracts/shared-lock.errors.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedRefreshReaderSemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedReleaseReaderSemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedReleaseWriterLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedRefreshWriterLockError,
} from "@/shared-lock/contracts/shared-lock.errors.js";
import type { ISharedLockState } from "@/shared-lock/contracts/shared-lock-state.contract.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type SharedLockAquireBlockingSettings = {
    time?: ITimeSpan;
    interval?: ITimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type IReaderSemaphore = {
    /**
     * The `runReader` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquire` and `release` method.
     *
     */
    runReader<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): Task<Result<TValue, LimitReachedReaderSemaphoreError>>;

    /**
     * The `runReaderOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireOrFail` and `release` method.
     * @throws {LimitReachedReaderSemaphoreError} {@link LimitReachedReaderSemaphoreError}
     */
    runReaderOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue>;

    /**
     * The `runReaderBlocking` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireBlocking` and `release` method.
     */
    runReaderBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): Task<Result<TValue, LimitReachedReaderSemaphoreError>>;

    /**
     * The `runReaderBlockingOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireBlockingOrFail` and `release` method.
     * @throws {LimitReachedReaderSemaphoreError} {@link LimitReachedReaderSemaphoreError}
     */
    runReaderBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): Task<TValue>;

    /**
     * The `acquireReader` method acquires an slots only if the slot limit is not reached.
     *
     * @returns Returns true if the slot limit is not reached otherwise false is returned.
     */
    acquireReader(): Task<boolean>;

    /**
     * The `acquireReaderOrFail` method acquires an slots only if the slot limit is not reached.
     * Throws an error if the slot limit is reached.
     *
     * @throws {LimitReachedReaderSemaphoreError} {@link LimitReachedReaderSemaphoreError}
     */
    acquireReaderOrFail(): Task<void>;

    /**
     * The `acquireReaderBlocking` method acquires an slots only if the slot limit is not reached.
     * If the slot limit is reached, it retries every `settings.interval` until `settings.time` is reached.
     *
     * @returns Returns true if the slot limit is not reached otherwise false is returned.
     */
    acquireReaderBlocking(
        settings?: SharedLockAquireBlockingSettings,
    ): Task<boolean>;

    /**
     * The `acquireReaderBlockingOrFail` method acquires an slots only if the slot limit is not reached.
     * If the slot limit is reached, it retries every `settings.interval` until `settings.time` is reached.
     * Throws an error if the slot limit is reached after the given `settings.time`.
     *
     * @throws {LimitReachedReaderSemaphoreError} {@link LimitReachedReaderSemaphoreError}
     */
    acquireReaderBlockingOrFail(
        settings?: SharedLockAquireBlockingSettings,
    ): Task<void>;

    /**
     * The `releaseReader` method releases the current slot.
     *
     * @returns Returns true if the semaphore exists and has at least one busy slot or false.
     */
    releaseReader(): Task<boolean>;

    /**
     * The `releaseReaderOrFail` method releases the current slot.
     * Throws an error if the slot is not acquired.
     * @throws {FailedReleaseReaderSemaphoreError} {@link FailedReleaseReaderSemaphoreError}
     */
    releaseReaderOrFail(): Task<void>;

    /**
     * The `forceReleaseAllReaders` method releases the all slots.
     *
     * @returns Returns true if the semaphore exists and has at least one unavailable slot or false if all slots are available.
     */
    forceReleaseAllReaders(): Task<boolean>;

    /**
     * The `refreshReader` method updates the `ttl` of the slot when acquired.
     *
     * @returns Returns true if the slot is refreshed otherwise false is returned.
     */
    refreshReader(ttl?: ITimeSpan): Task<boolean>;

    /**
     * The `refreshReaderOrFail` method updates the `ttl` of the slot when acquired.
     * Throws an error if the slot is not acquired.
     * @throws {FailedRefreshReaderSemaphoreError} {@link FailedRefreshReaderSemaphoreError}
     */
    refreshReaderOrFail(ttl?: ITimeSpan): Task<void>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type IWriterLock = {
    /**
     * The `runWriter` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquire` and `release` method.
     */
    runWriter<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): Task<Result<TValue, FailedAcquireWriterLockError>>;

    /**
     * The `runWriterOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireOrFail` and `release` method.
     * @throws {FailedAcquireWriterLockError} {@link FailedAcquireWriterLockError}
     */
    runWriterOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue>;

    /**
     * The `runWriterBlocking` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireBlocking` and `release` method.
     */
    runWriterBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): Task<Result<TValue, FailedAcquireWriterLockError>>;

    /**
     * The `runWriterBlockingOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireBlockingOrFail` and `release` method.
     * @throws {FailedAcquireWriterLockError} {@link FailedAcquireWriterLockError}
     */
    runWriterBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): Task<TValue>;

    /**
     * The `acquireWriter` method acquires a lock only if the key is not already acquired by different owner.
     *
     * @returns Returns true if the lock is not already acquired otherwise false is returned.
     */
    acquireWriter(): Task<boolean>;

    /**
     * The `acquireWriterOrFail` method acquires a lock only if the key is not already acquired by different owner.
     * Throws an error if the lock is already acquired by different owner.
     *
     * @throws {FailedAcquireWriterLockError} {@link FailedAcquireWriterLockError}
     */
    acquireWriterOrFail(): Task<void>;

    /**
     * The `acquireWriterBlocking` method acquires a lock only if the key is not already acquired by different owner.
     * If the lock is not acquired, it retries every `settings.interval` until `settings.time` is reached.
     *
     * @returns Returns true if the lock is not already acquired otherwise false is returned.
     */
    acquireWriterBlocking(
        settings?: SharedLockAquireBlockingSettings,
    ): Task<boolean>;

    /**
     * The `acquireWriterBlockingOrFail` method acquires a lock only if the key is not already acquired by different owner.
     * If the lock is not acquired, it retries every `settings.interval` until `settings.time` is reached.
     * Throws an error if the lock is already acquired by different owner.
     *
     * @throws {FailedAcquireWriterLockError} {@link FailedAcquireWriterLockError}
     */
    acquireWriterBlockingOrFail(
        settings?: SharedLockAquireBlockingSettings,
    ): Task<void>;

    /**
     * The `releaseWriter` method releases a lock if owned by the same owner.
     *
     * @returns Returns true if the lock is released otherwise false is returned.
     */
    releaseWriter(): Task<boolean>;

    /**
     * The `releaseWriterOrFail` method releases a lock if owned by the same owner.
     * Throws an error if the lock is not owned by same owner.
     *
     * @throws {FailedReleaseWriterLockError} {@link FailedReleaseWriterLockError}
     */
    releaseWriterOrFail(): Task<void>;

    /**
     * The `forceReleaseWriter` method releases a lock regardless of the owner.
     *
     * @returns Returns true if the lock exists or false if the lock doesnt exists.
     */
    forceReleaseWriter(): Task<boolean>;

    /**
     * The `refreshWriter` method updates the `ttl` of the lock if expireable and owned by the same owner.
     *
     * @returns Returns true if the lock is refreshed otherwise false is returned.
     */
    refreshWriter(ttl?: ITimeSpan): Task<boolean>;

    /**
     * The `refreshWriterOrFail` method updates the `ttl` of the lock if expireable and owned by the same owner.
     * Throws an error if the lock is not owned by same owner.
     * Throws an error if the key is unexpirable.
     *
     * @throws {FailedRefreshWriterLockError} {@link FailedRefreshWriterLockError}
     */
    refreshWriterOrFail(ttl?: ITimeSpan): Task<void>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type ISharedLockStateMethods = {
    getState(): Task<ISharedLockState>;

    /**
     * The `key` of the `ISharedLock` instance.
     */
    readonly key: string;

    /**
     * The `id` of the `ISharedLock` instance.
     */
    readonly id: string;

    /**
     * The `ttl` of `ISharedLock` instance.
     */
    readonly ttl: TimeSpan | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type ISharedLockBase = IReaderSemaphore &
    IWriterLock & {
        forceRelease(): Task<boolean>;
    };

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type ISharedLock = ISharedLockBase & ISharedLockStateMethods;

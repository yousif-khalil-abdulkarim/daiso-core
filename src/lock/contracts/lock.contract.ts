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
    FailedAcquireLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedReleaseLockError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedRefreshLockError,
} from "@/lock/contracts/lock.errors.js";
import type { ILockState } from "@/lock/contracts/lock-state.contract.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type LockAquireBlockingSettings = {
    time?: TimeSpan;
    interval?: TimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockStateMethods = {
    getState(): LazyPromise<ILockState>;

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
    readonly ttl: TimeSpan | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockBase = {
    /**
     * The `run` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquire` and `release` method.
     */
    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, FailedAcquireLockError>>;

    /**
     * The `runOrFail` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireOrFail` and `release` method.
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): LazyPromise<TValue>;

    /**
     * The `runBlocking` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireBlocking` and `release` method.
     */
    runBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<Result<TValue, FailedAcquireLockError>>;

    /**
     * The `runBlockingOrFail` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireBlockingOrFail` and `release` method.
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<TValue>;

    /**
     * The `acquire` method acquires a lock only if the key is not already acquired by different owner.
     *
     * @returns Returns true if the lock is not already acquired otherwise false is returned.
     */
    acquire(): LazyPromise<boolean>;

    /**
     * The `acquireOrFail` method acquires a lock only if the key is not already acquired by different owner.
     * Throws an error if the lock is already acquired by different owner.
     *
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    acquireOrFail(): LazyPromise<void>;

    /**
     * The `acquireBlocking` method acquires a lock only if the key is not already acquired by different owner.
     * If the lock is not acquired, it retries every `settings.interval` until `settings.time` is reached.
     *
     * @returns Returns true if the lock is not already acquired otherwise false is returned.
     */
    acquireBlocking(
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<boolean>;

    /**
     * The `acquireBlockingOrFail` method acquires a lock only if the key is not already acquired by different owner.
     * If the lock is not acquired, it retries every `settings.interval` until `settings.time` is reached.
     * Throws an error if the lock is already acquired by different owner.
     *
     * @throws {FailedAcquireLockError} {@link FailedAcquireLockError}
     */
    acquireBlockingOrFail(
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<void>;

    /**
     * The `release` method releases a lock if owned by the same owner.
     *
     * @returns Returns true if the lock is released otherwise false is returned.
     */
    release(): LazyPromise<boolean>;

    /**
     * The `releaseOrFail` method releases a lock if owned by the same owner.
     * Throws an error if the lock is not owned by same owner.
     *
     * @throws {FailedReleaseLockError} {@link FailedReleaseLockError}
     */
    releaseOrFail(): LazyPromise<void>;

    /**
     * The `forceRelease` method releases a lock regardless of the owner.
     *
     * @returns Returns true if the lock exists or false if the lock doesnt exists.
     */
    forceRelease(): LazyPromise<boolean>;

    /**
     * The `refresh` method updates the `ttl` of the lock if expireable and owned by the same owner.
     *
     * @returns Returns true if the lock is refreshed otherwise false is returned.
     */
    refresh(ttl?: TimeSpan): LazyPromise<boolean>;

    /**
     * The `refreshOrFail` method updates the `ttl` of the lock if expireable and owned by the same owner.
     * Throws an error if the lock is not owned by same owner.
     * Throws an error if the key is unexpirable.
     *
     * @throws {FailedRefreshLockError} {@link FailedRefreshLockError}
     */
    refreshOrFail(ttl?: TimeSpan): LazyPromise<void>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILock = ILockBase & ILockStateMethods;

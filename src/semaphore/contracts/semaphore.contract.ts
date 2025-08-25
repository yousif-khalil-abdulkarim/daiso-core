/**
 * @module Semaphore
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import type {
    AsyncLazy,
    Result,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    LimitReachedSemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnsuccessfulRefreshSemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnsuccessfulReleaseSemaphoreError,
} from "@/semaphore/contracts/semaphore.errors.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type SemaphoreAquireBlockingSettings = {
    time?: TimeSpan;
    interval?: TimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphore = {
    /**
     * The `run` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquire` and `release` method.
     *
     */
    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, LimitReachedSemaphoreError>>;

    /**
     * The `runOrFail` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireOrFail` and `release` method.
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): LazyPromise<TValue>;

    /**
     * The `runBlocking` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireBlocking` and `release` method.
     */
    runBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<Result<TValue, LimitReachedSemaphoreError>>;

    /**
     * The `runBlockingOrFail` method wraps an {@link Invokable | `Invokable`} or {@link LazyPromise| `LazyPromise`} with the `acquireBlockingOrFail` and `release` method.
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<TValue>;

    /**
     * The `acquire` method acquires an amount of slots only if the slot limit is not reached.
     *
     * @returns Returns true if the slot limit is not reached otherwise false is returned.
     */
    acquire(): LazyPromise<boolean>;

    /**
     * The `acquireOrFail` method acquires an amount of slots only if the slot limit is not reached.
     * Throws an error if the slot limit is reached.
     *
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    acquireOrFail(): LazyPromise<void>;

    /**
     * The `acquireBlocking` method acquires an amount of slots only if the slot limit is not reached.
     * If the slot limit is reached, it retries every `settings.interval` until `settings.time` is reached.
     *
     * @returns Returns true if the slot limit is not reached otherwise false is returned.
     */
    acquireBlocking(
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<boolean>;

    /**
     * The `acquireBlockingOrFail` method acquires an amount of slots only if the slot limit is not reached.
     * If the slot limit is reached, it retries every `settings.interval` until `settings.time` is reached.
     * Throws an error if the slot limit is reached after the given `settings.time`.
     *
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    acquireBlockingOrFail(
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<void>;

    /**
     * The `release` method releases the current slot.
     *
     * @returns Returns true if the semaphore exists and has at least one busy slot or false.
     */
    release(): LazyPromise<boolean>;

    /**
     * The `releaseOrFail` method releases the current slot.
     * Throws an error if the slot is not acquired.
     * @throws {UnsuccessfulReleaseSemaphoreError} {@link UnsuccessfulReleaseSemaphoreError}
     */
    releaseOrFail(): LazyPromise<void>;

    /**
     * The `forceReleaseAll` method releases the all slots.
     *
     * @returns Returns true if the semaphore exists and has at least one unavailable slot or false if all slots are available.
     */
    forceReleaseAll(): LazyPromise<boolean>;

    /**
     * The `refresh` method updates the `ttl` of the slot when acquired.
     *
     * @returns Returns true if the slot is refreshed otherwise false is returned.
     */
    refresh(ttl?: TimeSpan): LazyPromise<boolean>;

    /**
     * The `refreshOrFail` method updates the `ttl` of the slot when acquired.
     * Throws an error if the slot is not acquired.
     * @throws {UnsuccessfulRefreshSemaphoreError} {@link UnsuccessfulRefreshSemaphoreError}
     */
    refreshOrFail(ttl?: TimeSpan): LazyPromise<void>;

    /**
     * The `isExpired` method returns true if the slot is expired otherwise false is returned.
     */
    isExpired(): LazyPromise<boolean>;

    /**
     * The `isAcquired` method returns true if the slot is in use otherwise false is returned.
     */
    isAcquired(): LazyPromise<boolean>;

    /**
     * The `getRemainingTime` return the reaming time as {@link TimeSpan | `TimeSpan`}.
     *
     * @returns Returns null if the key doesnt exist, if slot doesnt exist, if the slot has expired and key has no expiration.
     */
    getRemainingTime(): LazyPromise<TimeSpan | null>;

    /**
     * The `getLimit` method returns a number of slots or `null` if the has not been acquired and therby doesnt exists in the database.
     *
     * @returns Returns null if the key doesnt exist.
     */
    getLimit(): LazyPromise<number | null>;

    /**
     * The `availableSlots` method returns amount of free slots.
     *
     * @returns Returns null if the key doesnt exist, if slot doesnt exist or if the slot has expired.
     */
    availableSlots(): LazyPromise<number | null>;

    /**
     * The `unavailableSlots` method returns amount of currently used slots.
     *
     * @returns Returns null if the key doesnt exist, if slot doesnt exist or if the slot has expired.
     */
    unavailableSlots(): LazyPromise<number | null>;
};

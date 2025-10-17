/**
 * @module Semaphore
 */

import type { Task } from "@/task/_module-exports.js";
import type {
    AsyncLazy,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Invokable,
    Result,
} from "@/utilities/_module-exports.js";
import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    LimitReachedSemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedRefreshSemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FailedReleaseSemaphoreError,
} from "@/semaphore/contracts/semaphore.errors.js";
import type { ISemaphoreState } from "@/semaphore/contracts/semaphore-state.contract.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreStateMethods = {
    getState(): Task<ISemaphoreState>;

    /**
     * The `key` of the `ISemaphore` instance.
     */
    readonly key: string;

    /**
     * The `id` of the `ISemaphore` instance.
     */
    readonly id: string;

    /**
     * The `ttl` of `ISemaphore` instance.
     */
    readonly ttl: ITimeSpan | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type SemaphoreAquireBlockingSettings = {
    time?: ITimeSpan;
    interval?: ITimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreBase = {
    /**
     * The `run` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquire` and `release` method.
     *
     */
    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): Task<Result<TValue, LimitReachedSemaphoreError>>;

    /**
     * The `runOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireOrFail` and `release` method.
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue>;

    /**
     * The `runBlocking` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireBlocking` and `release` method.
     */
    runBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): Task<Result<TValue, LimitReachedSemaphoreError>>;

    /**
     * The `runBlockingOrFail` method wraps an {@link Invokable | `Invokable`} or {@link Task | `Task`} with the `acquireBlockingOrFail` and `release` method.
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): Task<TValue>;

    /**
     * The `acquire` method acquires an slots only if the slot limit is not reached.
     *
     * @returns Returns true if the slot limit is not reached otherwise false is returned.
     */
    acquire(): Task<boolean>;

    /**
     * The `acquireOrFail` method acquires an slots only if the slot limit is not reached.
     * Throws an error if the slot limit is reached.
     *
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    acquireOrFail(): Task<void>;

    /**
     * The `acquireBlocking` method acquires an slots only if the slot limit is not reached.
     * If the slot limit is reached, it retries every `settings.interval` until `settings.time` is reached.
     *
     * @returns Returns true if the slot limit is not reached otherwise false is returned.
     */
    acquireBlocking(settings?: SemaphoreAquireBlockingSettings): Task<boolean>;

    /**
     * The `acquireBlockingOrFail` method acquires an slots only if the slot limit is not reached.
     * If the slot limit is reached, it retries every `settings.interval` until `settings.time` is reached.
     * Throws an error if the slot limit is reached after the given `settings.time`.
     *
     * @throws {LimitReachedSemaphoreError} {@link LimitReachedSemaphoreError}
     */
    acquireBlockingOrFail(
        settings?: SemaphoreAquireBlockingSettings,
    ): Task<void>;

    /**
     * The `release` method releases the current slot.
     *
     * @returns Returns true if the semaphore exists and has at least one busy slot or false.
     */
    release(): Task<boolean>;

    /**
     * The `releaseOrFail` method releases the current slot.
     * Throws an error if the slot is not acquired.
     * @throws {FailedReleaseSemaphoreError} {@link FailedReleaseSemaphoreError}
     */
    releaseOrFail(): Task<void>;

    /**
     * The `forceReleaseAll` method releases the all slots.
     *
     * @returns Returns true if the semaphore exists and has at least one unavailable slot or false if all slots are available.
     */
    forceReleaseAll(): Task<boolean>;

    /**
     * The `refresh` method updates the `ttl` of the slot when acquired.
     *
     * @returns Returns true if the slot is refreshed otherwise false is returned.
     */
    refresh(ttl?: ITimeSpan): Task<boolean>;

    /**
     * The `refreshOrFail` method updates the `ttl` of the slot when acquired.
     * Throws an error if the slot is not acquired.
     * @throws {FailedRefreshSemaphoreError} {@link FailedRefreshSemaphoreError}
     */
    refreshOrFail(ttl?: ITimeSpan): Task<void>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphore = ISemaphoreStateMethods & ISemaphoreBase;

/**
 * @module Semaphore
 */

import type {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnexpectedSemaphoreError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TimeoutSemaphoreError,
} from "@/contracts/semaphore/_shared";

export type SemaphoreAcquireSettings = {
    timeoutInMs?: number | null;
};

/**
 * @throw {SemaphoreError} {@link SemaphoreError}
 * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
 */
export type ISemaphore = {
    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     */
    getMaxCount(): Promise<number>;

    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     */
    getName(): Promise<string>;

    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     */
    acquire(settings?: SemaphoreAcquireSettings): Promise<boolean>;

    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     * @throw {TimeoutSemaphoreError} {@link TimeoutSemaphoreError}
     */
    acquireOrFail(settings?: SemaphoreAcquireSettings): Promise<void>;

    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     */
    release(): Promise<void>;

    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     */
    do(
        fn: () => Promise<void>,
        settings?: SemaphoreAcquireSettings,
    ): Promise<boolean>;

    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     * @throw {TimeoutSemaphoreError} {@link TimeoutSemaphoreError}
     */
    doOrFail(
        fn: () => Promise<void>,
        settings?: SemaphoreAcquireSettings,
    ): Promise<void>;

    /**
     * @throw {SemaphoreError} {@link SemaphoreError}
     * @throw {UnexpectedSemaphoreError} {@link UnexpectedSemaphoreError}
     */
    doAndReturn<TValue>(
        fn: () => Promise<TValue>,
        settings?: SemaphoreAcquireSettings,
    ): Promise<TValue | null>;
};

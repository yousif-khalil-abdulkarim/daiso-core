/**
 * @module SharedLock
 */

import { LazyPromise } from "@/async/_module-exports.js";
import {
    FailedRefreshSemaphoreError,
    FailedReleaseSemaphoreError,
    LimitReachedSemaphoreError,
    type ISemaphore,
    type ISemaphoreState,
    type SemaphoreAquireBlockingSettings,
} from "@/semaphore/contracts/_module-exports.js";
import {
    FailedRefreshReaderSemaphoreError,
    FailedReleaseReaderSemaphoreError,
    LimitReachedReaderSemaphoreError,
    type ISharedLock,
    type ISharedLockState,
} from "@/shared-lock/contracts/_module-exports.js";
import {
    RESULT,
    resultFailure,
    type AsyncLazy,
    type Result,
    type TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
class ToSemaphoreState implements ISemaphoreState {
    constructor(private readonly sharedLockState: ISharedLockState) {}

    isExpired(): boolean {
        throw new Error("Method not implemented.");
    }

    isAcquired(): boolean {
        throw new Error("Method not implemented.");
    }

    getRemainingTime(): TimeSpan | null {
        throw new Error("Method not implemented.");
    }

    getLimit(): number {
        throw new Error("Method not implemented.");
    }

    freeSlotsCount(): number {
        throw new Error("Method not implemented.");
    }

    acquiredSlotsCount(): number {
        throw new Error("Method not implemented.");
    }

    acquiredSlots(): string[] {
        throw new Error("Method not implemented.");
    }
}

/**
 * Converts a {@link ISharedLock | `ISharedLock`} to  {@link ISemaphore | `ISemaphore`}.
 *
 * Note the returned object is not serializable.
 *
 * @group Helpers
 */
export class ToSemaphore implements ISemaphore {
    constructor(private readonly sharedLock: ISharedLock) {}

    getState(): LazyPromise<ISemaphoreState | null> {
        return new LazyPromise(async (): Promise<ISemaphoreState | null> => {
            const sharedLockState = await this.sharedLock.getState();
            if (sharedLockState === null) {
                return null;
            }
            return new ToSemaphoreState(sharedLockState);
        });
    }

    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, LimitReachedSemaphoreError>> {
        return new LazyPromise(async () => {
            const result = await this.sharedLock.runReader(asyncFn);
            if (result.type === RESULT.SUCCESS) {
                return result;
            }
            const convertedError = new LimitReachedSemaphoreError(
                result.error.message,
                result.error.cause,
            );
            convertedError.stack = result.error.stack;
            return resultFailure(convertedError);
        });
    }

    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): LazyPromise<TValue> {
        return new LazyPromise(async () => {
            try {
                return await this.sharedLock.runReaderOrFail(asyncFn);
            } catch (error: unknown) {
                if (error instanceof LimitReachedReaderSemaphoreError) {
                    const convertedError = new LimitReachedSemaphoreError(
                        error.message,
                        error.cause,
                    );
                    convertedError.stack = error.stack;
                    throw convertedError;
                }
                throw error;
            }
        });
    }

    runBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<Result<TValue, LimitReachedSemaphoreError>> {
        return new LazyPromise(async () => {
            return new LazyPromise(async () => {
                const result = await this.sharedLock.runReaderBlocking(
                    asyncFn,
                    settings,
                );
                if (result.type === RESULT.SUCCESS) {
                    return result;
                }
                const convertedError = new LimitReachedSemaphoreError(
                    result.error.message,
                    result.error.cause,
                );
                convertedError.stack = result.error.stack;
                return resultFailure(convertedError);
            });
        });
    }

    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<TValue> {
        return new LazyPromise(async () => {
            try {
                return await this.sharedLock.runReaderBlockingOrFail(
                    asyncFn,
                    settings,
                );
            } catch (error: unknown) {
                if (error instanceof LimitReachedReaderSemaphoreError) {
                    const convertedError = new LimitReachedSemaphoreError(
                        error.message,
                        error.cause,
                    );
                    convertedError.stack = error.stack;
                    throw convertedError;
                }
                throw error;
            }
        });
    }

    acquire(): LazyPromise<boolean> {
        return this.sharedLock.acquireReader();
    }

    acquireOrFail(): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.acquireReaderOrFail();
            } catch (error: unknown) {
                if (error instanceof LimitReachedReaderSemaphoreError) {
                    const convertedError = new LimitReachedSemaphoreError(
                        error.message,
                        error.cause,
                    );
                    convertedError.stack = error.stack;
                    throw convertedError;
                }
                throw error;
            }
        });
    }

    acquireBlocking(
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<boolean> {
        return this.sharedLock.acquireReaderBlocking(settings);
    }

    acquireBlockingOrFail(
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.acquireReaderBlockingOrFail(settings);
            } catch (error: unknown) {
                if (error instanceof LimitReachedReaderSemaphoreError) {
                    const convertedError = new LimitReachedSemaphoreError(
                        error.message,
                        error.cause,
                    );
                    convertedError.stack = error.stack;
                    throw convertedError;
                }
                throw error;
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.sharedLock.releaseReader();
    }

    releaseOrFail(): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.releaseReaderOrFail();
            } catch (error: unknown) {
                if (error instanceof FailedReleaseReaderSemaphoreError) {
                    const convertedError = new FailedReleaseSemaphoreError(
                        error.message,
                        error.cause,
                    );
                    convertedError.stack = error.stack;
                    throw convertedError;
                }
                throw error;
            }
        });
    }

    forceReleaseAll(): LazyPromise<boolean> {
        return this.sharedLock.forceReleaseAllReaders();
    }

    refresh(ttl?: TimeSpan): LazyPromise<boolean> {
        return this.sharedLock.refreshReader(ttl);
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.refreshReaderOrFail(ttl);
            } catch (error: unknown) {
                if (error instanceof FailedRefreshReaderSemaphoreError) {
                    const convertedError = new FailedRefreshSemaphoreError(
                        error.message,
                        error.cause,
                    );
                    convertedError.stack = error.stack;
                    throw convertedError;
                }
                throw error;
            }
        });
    }

    getId(): string {
        return this.sharedLock.getId();
    }

    getTtl(): TimeSpan | null {
        return this.sharedLock.getTtl();
    }
}

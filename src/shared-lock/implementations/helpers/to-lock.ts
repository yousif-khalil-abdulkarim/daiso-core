/**
 * @module SharedLock
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type { ILockState } from "@/lock/contracts/lock-state.contract.js";
import type {
    ILock,
    LockAquireBlockingSettings,
} from "@/lock/contracts/lock.contract.js";
import {
    FailedAcquireLockError,
    FailedRefreshLockError,
    FailedReleaseLockError,
} from "@/lock/contracts/lock.errors.js";
import type { ISharedLockState } from "@/shared-lock/contracts/_module-exports.js";
import type { ISharedLock } from "@/shared-lock/contracts/_module-exports.js";
import {
    FailedAcquireWriterLockError,
    FailedRefreshWriterLockError,
    FailedReleaseWriterLockError,
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
class ToLockState implements ILockState {
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

    getOwner(): string {
        throw new Error("Method not implemented.");
    }
}

/**
 * Converts a {@link ISharedLock | `ISharedLock`} to  {@link ILock | `ILock`}.
 *
 * Note the returned object is not serializable.
 *
 * @group Helpers
 */
export class ToLock implements ILock {
    constructor(private readonly sharedLock: ISharedLock) {}

    getState(): LazyPromise<ILockState | null> {
        return new LazyPromise(async (): Promise<ILockState | null> => {
            const sharedLockState = await this.sharedLock.getState();
            if (sharedLockState === null) {
                return null;
            }
            return new ToLockState(sharedLockState);
        });
    }

    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, FailedAcquireLockError>> {
        return new LazyPromise(async () => {
            const result = await this.sharedLock.runWriter(asyncFn);
            if (result.type === RESULT.SUCCESS) {
                return result;
            }
            const convertedError = new FailedAcquireLockError(
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
                return await this.sharedLock.runWriterOrFail(asyncFn);
            } catch (error: unknown) {
                if (error instanceof FailedAcquireWriterLockError) {
                    const convertedError = new FailedAcquireLockError(
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
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<Result<TValue, FailedAcquireLockError>> {
        return new LazyPromise(async () => {
            return new LazyPromise(async () => {
                const result = await this.sharedLock.runWriterBlocking(
                    asyncFn,
                    settings,
                );
                if (result.type === RESULT.SUCCESS) {
                    return result;
                }
                const convertedError = new FailedAcquireLockError(
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
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<TValue> {
        return new LazyPromise(async () => {
            try {
                return await this.sharedLock.runWriterBlockingOrFail(
                    asyncFn,
                    settings,
                );
            } catch (error: unknown) {
                if (error instanceof FailedAcquireWriterLockError) {
                    const convertedError = new FailedAcquireLockError(
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
        return this.sharedLock.acquireWriter();
    }

    acquireOrFail(): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.acquireWriterOrFail();
            } catch (error: unknown) {
                if (error instanceof FailedAcquireWriterLockError) {
                    const convertedError = new FailedAcquireLockError(
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
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<boolean> {
        return this.sharedLock.acquireWriterBlocking(settings);
    }

    acquireBlockingOrFail(
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.acquireWriterBlockingOrFail(settings);
            } catch (error: unknown) {
                if (error instanceof FailedAcquireWriterLockError) {
                    const convertedError = new FailedAcquireLockError(
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
        return this.sharedLock.releaseWriter();
    }

    releaseOrFail(): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.releaseWriterOrFail();
            } catch (error: unknown) {
                if (error instanceof FailedReleaseWriterLockError) {
                    const convertedError = new FailedReleaseLockError(
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

    forceRelease(): LazyPromise<boolean> {
        return this.sharedLock.forceReleaseWriter();
    }

    refresh(ttl?: TimeSpan): LazyPromise<boolean> {
        return this.sharedLock.refreshWriter(ttl);
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.sharedLock.refreshWriterOrFail(ttl);
            } catch (error: unknown) {
                if (error instanceof FailedRefreshWriterLockError) {
                    const convertedError = new FailedRefreshLockError(
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

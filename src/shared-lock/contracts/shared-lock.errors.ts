/**
 * @module SharedLock
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class SharedLockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SharedLockError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class ReaderSemaphoreError extends SharedLockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = ReaderSemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to acquire a semaphore slot, but all slots are already taken.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class LimitReachedReaderSemaphoreError extends ReaderSemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = LimitReachedReaderSemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to referesh a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedRefreshReaderSemaphoreError extends ReaderSemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedRefreshReaderSemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to release a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedReleaseReaderSemaphoreError extends ReaderSemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedReleaseReaderSemaphoreError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export const READER_SEMAPHORE_ERRORS = {
    READER: ReaderSemaphoreError,
    ReachedLimit: LimitReachedReaderSemaphoreError,
    FailedRefresh: FailedRefreshReaderSemaphoreError,
    FailedRelease: FailedReleaseReaderSemaphoreError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class WriterLockError extends SharedLockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedAcquireWriterLockError extends WriterLockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedReleaseWriterLockError extends WriterLockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to referesh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedRefreshWriterLockError extends WriterLockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export const WRITER_LOCK_ERRORS = {
    WRITER: WriterLockError,
    FailedAcquire: FailedAcquireWriterLockError,
    FailedRelease: FailedReleaseWriterLockError,
    FailedRefresh: FailedRefreshWriterLockError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export const SHARED_LOCK_ERRORS = {
    ...READER_SEMAPHORE_ERRORS,
    ...WRITER_LOCK_ERRORS,
} as const;

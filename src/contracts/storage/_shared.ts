/**
 * @module Storage
 */

/**
 * @group Errors
 */
export class StorageError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = StorageError.name;
    }
}

/**
 * @group Errors
 */
export class UnexpectedStorageError extends StorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedStorageError.name;
    }
}

/**
 * @group Errors
 */
export class TypeStorageError extends StorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeStorageError.name;
    }
}

/**
 * @group Errors
 */
export class KeyNotFoundStorageError extends StorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeyNotFoundStorageError.name;
    }
}

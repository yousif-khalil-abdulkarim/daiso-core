/**
 * @module FileStorage
 */

import { type IKey } from "@/namespace/contracts/_module.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Errors
 */
export class KeyNotFoundFileStorageError extends Error {
    static create(key: IKey, cause?: unknown): KeyNotFoundFileStorageError {
        return new KeyNotFoundFileStorageError(
            `Key "${key.get()}" is not found`,
            cause,
        );
    }

    /**
     * @internal
     */
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeyNotFoundFileStorageError.name;
    }
}

/**
 * IMPORT_PATH: `"@daiso-tech/core/file-storage/contracts"`
 * @group Errors
 */
export class KeyExistsFileStorageError extends Error {
    static create(key: IKey, cause?: unknown): KeyExistsFileStorageError {
        return new KeyExistsFileStorageError(
            `Key "${key.get()}" already exists`,
            cause,
        );
    }

    /**
     * @internal
     */
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeyExistsFileStorageError.name;
    }
}

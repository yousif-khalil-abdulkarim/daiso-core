/**
 * @module Cache
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export class CacheError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CacheError.name;
    }
}

/**
 * The error is thrown when attempting to increment or decrement a key that is not of number type.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export class TypeCacheError extends CacheError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeCacheError.name;
    }
}

/**
 * The error is thrown when a key is not found
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export class KeyNotFoundCacheError extends CacheError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeyNotFoundCacheError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export const CACHE_ERRORS = {
    Base: CacheError,
    Type: TypeCacheError,
    KeyNotFound: KeyNotFoundCacheError,
} as const;

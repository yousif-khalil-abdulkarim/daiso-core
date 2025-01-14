/**
 * @module Cache
 */

/**
 * @group Errors
 */
export class CacheError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CacheError.name;
    }
}

/**
 * @group Errors
 */
export class UnexpectedCacheError extends CacheError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedCacheError.name;
    }
}

/**
 * @group Errors
 */
export class TypeCacheError extends CacheError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeCacheError.name;
    }
}

/**
 * @group Errors
 */
export class KeyNotFoundCacheError extends CacheError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeyNotFoundCacheError.name;
    }
}

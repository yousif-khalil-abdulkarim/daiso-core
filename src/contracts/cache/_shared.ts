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
export class InvalidValueCacheError extends CacheError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeCacheError.name;
    }
}

export type ValueWithTTL<TValue> = {
    value: TValue;
    ttlInMs?: number | null;
};

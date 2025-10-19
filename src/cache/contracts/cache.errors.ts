/**
 * @module Cache
 */

/**
 * The error is thrown when a key is not found
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export class KeyNotFoundCacheError extends Error {
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
    KeyNotFound: KeyNotFoundCacheError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export type AllCacheErrors = KeyNotFoundCacheError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Errors
 */
export function isCacheError(value: unknown): value is AllCacheErrors {
    for (const ErrorClass of Object.values(CACHE_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}

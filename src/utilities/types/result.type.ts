/**
 * @module Utilities
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type ResultFailure<TError = unknown> = [value: null, errror: TError];

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type ResultSuccess<TValue> = [value: TValue, error: null];

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type Result<TValue, TError = unknown> =
    | ResultFailure<TError>
    | ResultSuccess<TValue>;

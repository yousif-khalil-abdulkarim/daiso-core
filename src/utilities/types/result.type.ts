/**
 * @module Utilities
 */

export const RESULT = {
    FAILURE: "failure",
    SUCCESS: "success",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type ResultFailure<TError = unknown> = {
    type: (typeof RESULT)["FAILURE"];
    error: TError;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type ResultSuccess<TValue> = {
    type: (typeof RESULT)["SUCCESS"];
    value: TValue;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type Result<TValue, TError = unknown> =
    | ResultFailure<TError>
    | ResultSuccess<TValue>;

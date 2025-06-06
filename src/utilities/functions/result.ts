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
export type ResultSuccess<TValue = unknown> = {
    type: (typeof RESULT)["SUCCESS"];
    value: TValue;
};

/**
 * The `Result` type represents either success or failure.
 *
 * @example
 * ```ts
 * import { Result, resultFailure, resultSuccess, RESULT } from "@daiso-tech/core/utilities";
 *
 * function random(): Result<string, Error> {
 *   const nbr = Math.round(Math.random() * 100);
 *   if (nbr > 50) {
 *     // The resultFailure function return a failed result
 *     return resultFailure(new Error("Unexpected error occured"));
 *   }
 *   // The resultSuccess function return a success result
 *   return resultSuccess("Function succeded");
 * }
 *
 * const result = random();
 *
 * // Checking for failure
 * if (result.type === RESULT.FAILURE) {
 *   console.log("Error occured:", result.error);
 * }
 *
 * // Checking for success
 * if (result.type === RESULT.SUCCESS) {
 *   console.log("Result was successful:", result.value);
 * }
 * ```
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type Result<TValue = unknown, TError = unknown> =
    | ResultFailure<TError>
    | ResultSuccess<TValue>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type InferResultError<TValue> = TValue extends Result
    ? Extract<TValue, ResultFailure>["error"]
    : unknown;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type InferResultSuccess<TValue> = TValue extends Result
    ? Extract<TValue, ResultSuccess>["value"]
    : TValue;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export function isResultFailure<TError = unknown>(
    value: unknown,
): value is ResultFailure<TError> {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        typeof value.type === "string" &&
        value.type === RESULT.FAILURE &&
        "error" in value
    );
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export function isResultSuccess<TSuccess = unknown>(
    value: unknown,
): value is ResultSuccess<TSuccess> {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        typeof value.type === "string" &&
        value.type === RESULT.SUCCESS &&
        "value" in value
    );
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export function isResult<TValue = unknown, TError = unknown>(
    value: unknown,
): value is Result<TValue, TError> {
    return isResultFailure(value) || isResultSuccess(value);
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export function resultFailure<TError = unknown>(
    error: TError,
): ResultFailure<TError> {
    return {
        type: RESULT.FAILURE,
        error,
    };
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export function resultSuccess<TValue>(value: TValue): ResultSuccess<TValue> {
    return {
        type: RESULT.SUCCESS,
        value,
    };
}

import {
    RESULT,
    type ResultFailure,
    type ResultSuccess,
} from "@/utilities/_module-exports.js";

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

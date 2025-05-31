import type {
    ResultFailure,
    ResultSuccess,
} from "@/utilities/types/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export function resultFailure<TError = unknown>(
    error: TError,
): ResultFailure<TError> {
    return [null, error];
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export function resultSuccess<TValue>(value: TValue): ResultSuccess<TValue> {
    return [value, null];
}

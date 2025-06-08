/**
 * @module Utilities
 */

import {
    callInvokable,
    isInvokable,
    type Invokable,
} from "@/utilities/functions/invokable.js";
import {
    isResult,
    isResultSuccess,
    type Result,
} from "@/utilities/functions/result.js";
import { isStandardSchema } from "@/utilities/functions/is-standard-schema.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isClass } from "@/utilities/functions/is-class.js";
import { type AnyClass } from "@/utilities/types/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Middlewares
 */
export type ErrorPolicyBoolSetting = {
    /**
     * If true will treat false return values as errors.
     * You can use this with `retry` middleware to rerun functions that return false.
     */
    treatFalseAsError: boolean;
};

/**
 * @internal
 */
export function isErrorPolicyBoolSetting(
    value: unknown,
): value is ErrorPolicyBoolSetting {
    return (
        typeof value === "object" &&
        value !== null &&
        "treatFalseAsError" in value &&
        typeof value.treatFalseAsError === "boolean"
    );
}

/**
 * The `ErrorPolicy` can be a predicate function, {@link StandardSchemaV1 | `StandardSchemaV1`} and a class.
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Middlewares
 */
export type ErrorPolicy<TError = unknown> =
    | Invokable<[error: TError], boolean>
    | StandardSchemaV1<TError>
    | AnyClass
    | ErrorPolicyBoolSetting;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Middlewares
 */
export type ErrorPolicySettings<TError = unknown> = {
    /**
     * You can choose what errors you want to retry. By default all erros will be retried.
     *
     * @default
     * ```ts
     * (_error: unknown) => true
     * ```
     */
    errorPolicy?: ErrorPolicy<TError>;
};

/**
 * @internal
 */
export async function callErrorPolicyOnValue<
    TValue = unknown,
    TError = unknown,
>(
    errorPolicy: ErrorPolicy<TError> = () => true,
    value: TValue | Result<TValue, TError>,
): Promise<boolean> {
    // Will retry if the value is false and the setting treatFalseAsError is true
    if (!isResult(value)) {
        const shouldRetry =
            isErrorPolicyBoolSetting(errorPolicy) &&
            typeof value === "boolean" &&
            !value &&
            errorPolicy.treatFalseAsError;
        return shouldRetry;
    }

    // Will not retry if the Result successful
    if (isResultSuccess(value)) {
        return false;
    }

    if (isInvokable(errorPolicy)) {
        return callInvokable(errorPolicy, value.error);
    }

    if (isStandardSchema(errorPolicy)) {
        const schemaResult = await errorPolicy["~standard"].validate(
            value.error,
        );
        return schemaResult.issues === undefined;
    }

    // This only need so typescript wont complain
    if (isErrorPolicyBoolSetting(errorPolicy)) {
        return false;
    }

    return value.error instanceof errorPolicy;
}

/**
 * @internal
 */
export async function callErrorPolicyOnThrow<TError = unknown>(
    errorPolicy: ErrorPolicy<TError> = () => true,
    error: TError,
): Promise<boolean> {
    if (isInvokable(errorPolicy)) {
        return callInvokable(errorPolicy, error);
    }

    if (isStandardSchema(errorPolicy)) {
        const result = await errorPolicy["~standard"].validate(error);
        return result.issues === undefined;
    }

    if (isClass(errorPolicy)) {
        return error instanceof errorPolicy;
    }

    return false;
}

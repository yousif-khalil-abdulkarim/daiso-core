/**
 * @module Utilities
 */

import {
    callInvokable,
    isInvokable,
    type Invokable,
} from "@/utilities/functions/invokable.js";
import {
    type ResultFailure,
    isResultFailure,
} from "@/utilities/functions/result.js";
import { isStandardSchema } from "@/utilities/functions/is-standard-schema.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * The `ErrorPolicy` can be a predicate function, {@link StandardSchemaV1 | `StandardSchemaV1`} and a class.
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Middlewares
 */
export type ErrorPolicy<TError = unknown> =
    | Invokable<[error: TError], boolean>
    | StandardSchemaV1<TError>
    | { new (...args: any[]): any };

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
export async function callErrorPolicy<TError = unknown>(
    errorPolicy: ErrorPolicy<TError> = () => true,
    value: TError | ResultFailure<TError>,
): Promise<boolean> {
    let error = value;
    if (isResultFailure(error)) {
        error = error.error;
    }
    if (isInvokable(errorPolicy)) {
        return callInvokable(errorPolicy, error);
    }

    if (isStandardSchema(errorPolicy)) {
        const result = await errorPolicy["~standard"].validate(error);
        return result.issues === undefined;
    }

    return value instanceof errorPolicy;
}

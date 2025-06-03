/**
 * @module Async
 */
import {
    callInvokable,
    isInvokable,
    type Invokable,
} from "@/utilities/_module-exports.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type ErrorPolicy<TInput = unknown, TOutput = unknown> =
    | Invokable<[error: unknown], boolean>
    | StandardSchemaV1<TInput, TOutput>;

/**
 * @internal
 */
export async function callErrorPolicy<TInput = unknown, TOutput = unknown>(
    errorPolicy: ErrorPolicy<TInput, TOutput>,
    value: unknown,
): Promise<boolean> {
    if (isInvokable(errorPolicy)) {
        return callInvokable(errorPolicy, value);
    }
    const result = await errorPolicy["~standard"].validate(value);
    return result.issues === undefined;
}

/**
 * @module Utilities
 */

import type { Promisable } from "@/utilities/types/promiseable.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type InvokableFn<TInput = unknown, TOutput = unknown> = (
    value: TInput,
) => Promisable<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type IInvokableObject<TInput = unknown, TOutput = unknown> = {
    invoke(value: TInput): Promisable<TOutput>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Invokable<TInput = unknown, TOutput = unknown> =
    | InvokableFn<TInput, TOutput>
    | IInvokableObject<TInput, TOutput>;

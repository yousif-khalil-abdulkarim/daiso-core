/**
 * @module Collection
 */

import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Transform<TInput, TOutput> = (value: TInput) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTransform<TInput, TOutput> = (
    value: TInput,
) => Promisable<TOutput>;

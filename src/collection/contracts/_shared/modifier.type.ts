/**
 * @module Collection
 */

import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Modifier<TInput, TOutput> = (collection: TInput) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncModifier<TInput, TOutput> = (
    collection: TInput,
) => Promisable<TOutput>;

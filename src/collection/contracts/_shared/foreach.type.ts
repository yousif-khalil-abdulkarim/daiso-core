/**
 * @module Collection
 */

import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type ForEach<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => unknown;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncForEach<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promisable<unknown>;

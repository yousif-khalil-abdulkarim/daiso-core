/**
 * @module Collection
 */

import type { Invokable, Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Map<TInput, TCollection, TOutput> = Invokable<
    [item: TInput, index: number, collection: TCollection],
    TOutput
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncMap<TInput, TCollection, TOutput> = Invokable<
    [item: TInput, index: number, collection: TCollection],
    Promisable<TOutput>
>;

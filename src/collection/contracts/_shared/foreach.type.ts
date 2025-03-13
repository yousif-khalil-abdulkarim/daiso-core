/**
 * @module Collection
 */

import type { Invokable, Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type ForEach<TInput, TCollection> = Invokable<
    [item: TInput, index: number, collection: TCollection],
    void
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncForEach<TInput, TCollection> = Invokable<
    [item: TInput, index: number, collection: TCollection],
    Promisable<void>
>;

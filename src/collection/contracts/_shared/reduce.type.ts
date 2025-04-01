/**
 * @module Collection
 */

import type { Invokable, Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type Reduce<TInput, TCollection, TOutput> = Invokable<
    [output: TOutput, item: TInput, index: number, collection: TCollection],
    TOutput
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type AsyncReduce<TInput, TCollection, TOutput> = Invokable<
    [output: TOutput, item: TInput, index: number, collection: TCollection],
    Promisable<TOutput>
>;

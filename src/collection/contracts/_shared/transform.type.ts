/**
 * @module Collection
 */

import type { Invokable, Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type Transform<TInput, TOutput> = Invokable<[value: TInput], TOutput>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type AsyncTransform<TInput, TOutput> = Invokable<
    [value: TInput],
    Promisable<TOutput>
>;

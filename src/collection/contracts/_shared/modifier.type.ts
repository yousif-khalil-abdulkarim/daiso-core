/**
 * @module Collection
 */

import type { Invokable, Promisable } from "@/utilities/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type Modifier<TInput, TOutput> = Invokable<
    [collection: TInput],
    TOutput
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type AsyncModifier<TInput, TOutput> = Invokable<
    [collection: TInput],
    Promisable<TOutput>
>;

/**
 * @module Collection
 */

import type { Invokable, Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type Tap<TCollection> = Invokable<[collection: TCollection], void>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection/contracts"`
 */
export type AsyncTap<TCollection> = Invokable<
    [collection: TCollection],
    Promisable<void>
>;

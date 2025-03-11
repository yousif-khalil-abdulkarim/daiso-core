/**
 * @module Collection
 */

import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Tap<TCollection> = (collection: TCollection) => unknown;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTap<TCollection> = (
    collection: TCollection,
) => Promisable<unknown>;

/**
 * @module Utilities
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Lazyable<TValue> = TValue | (() => TValue);

/**
 * @module Utilities
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import type { Promisable } from "@/utilities/types/promiseable.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_Lazy<TValue> = () => TValue;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_Lazyable<TValue> = TValue | NEW_Lazy<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_AsyncLazy_<TValue> = () => Promisable<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_AsyncLazy<TValue> =
    | NEW_AsyncLazy_<TValue>
    | LazyPromise<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_AsyncLazyable<TValue> = TValue | NEW_AsyncLazy<TValue>;

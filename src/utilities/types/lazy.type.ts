/**
 * @module Utilities
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import type { Promisable } from "@/utilities/types/promiseable.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Lazy<TValue> = () => TValue;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Lazyable<TValue> = TValue | Lazy<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AsyncLazy_<TValue> = () => Promisable<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AsyncLazy<TValue> = AsyncLazy_<TValue> | LazyPromise<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AsyncLazyable<TValue> = TValue | AsyncLazy<TValue>;

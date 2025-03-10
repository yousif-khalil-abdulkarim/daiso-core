/**
 * @module Utilities
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import type { Promisable } from "@/utilities/types/promiseable.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type LazyPromiseable<TValue> =
    | LazyPromise<TValue>
    | (() => Promisable<TValue>);

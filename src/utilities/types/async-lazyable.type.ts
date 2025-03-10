/**
 * @module Utilities
 */

import type { LazyPromiseable } from "@/utilities/types/lazy-promiseable.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AsyncLazyable<TValue> = TValue | LazyPromiseable<TValue>;

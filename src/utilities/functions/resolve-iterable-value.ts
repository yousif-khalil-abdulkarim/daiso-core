/**
 * @module Utilities
 */

import type { IterableValue } from "@/utilities/types/_module.js";
import { isIterable } from "@/utilities/functions/is-iterable.js";
import { arrayLikeToIterable } from "@/utilities/functions/array-like-to-iterable.js";

/**
 * @internal
 */
export function resolveIterableValue<TItem>(
    iterableValue: IterableValue<TItem>,
): Iterable<TItem> {
    if (isIterable(iterableValue)) {
        return iterableValue;
    }

    return arrayLikeToIterable(iterableValue);
}

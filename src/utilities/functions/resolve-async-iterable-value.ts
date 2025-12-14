/**
 * @module Utilities
 */

import type { AsyncIterableValue } from "@/utilities/types/_module.js";
import { isIterable } from "@/utilities/functions/is-iterable.js";
import { isArrayLike } from "@/utilities/functions/is-array-like.js";
import { arrayLikeToIterable } from "@/utilities/functions/array-like-to-iterable.js";
import { iterableToAsyncIterable } from "@/utilities/functions/iterable-to-async-iterable.js";

/**
 * @internal
 */
export function resolveAsyncIterableValue<TItem>(
    iterableValue: AsyncIterableValue<TItem>,
): AsyncIterable<TItem> {
    if (isIterable(iterableValue)) {
        return iterableToAsyncIterable(iterableValue);
    }

    if (isArrayLike(iterableValue)) {
        return iterableToAsyncIterable(arrayLikeToIterable(iterableValue));
    }

    return iterableValue;
}

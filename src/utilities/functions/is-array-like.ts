/**
 * @module Utilities
 */

import { isIterable } from "@/utilities/functions/is-iterable.js";

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isArrayLike<TItem>(value: any): value is ArrayLike<TItem> {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        !isIterable(value) &&
        typeof value === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value.length === "number"
    );
}

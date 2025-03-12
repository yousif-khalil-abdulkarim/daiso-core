/**
 * @module Utilities
 */

import { isIterable } from "@/collection/implementations/_shared.js";
import type { OneOrMore } from "@/utilities/types/_module.js";

/**
 * @internal
 */
export function resolveOneOrMore<TType>(value: OneOrMore<TType>): TType[] {
    if (isIterable(value)) {
        return [...value];
    }
    return [value];
}

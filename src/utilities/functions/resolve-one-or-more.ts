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

/**
 * @internal
 */
export function resolveOneOrMoreStr(
    name: OneOrMore<string>,
    joinStr = "/",
): string {
    if (typeof name === "string") {
        return name;
    }
    return resolveOneOrMore(name)
        .filter((str) => str.length > 0)
        .join(joinStr);
}

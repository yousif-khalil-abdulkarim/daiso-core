/**
 * @module Utilities
 */

import { isIterable } from "@/collection/implementations/_shared.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type OneOrMore<TItem> = TItem | Iterable<TItem>;

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

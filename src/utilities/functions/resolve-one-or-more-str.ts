/**
 * @module Utilities
 */

import type { OneOrMore } from "@/utilities/types/_module.js";
import { resolveOneOrMore } from "@/utilities/functions/resolve-one-or-more.js";

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

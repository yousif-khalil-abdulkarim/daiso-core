/**
 * @module Utilities
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type { Lazyable, OneOrMore } from "@/utilities/types.js";
import { type AsyncLazyable } from "@/utilities/types.js";

/**
 * @internal
 */
export function resolveLazyable<TValue>(lazyable: Lazyable<TValue>): TValue {
    if (typeof lazyable === "function") {
        const getValue = lazyable as () => TValue;
        return getValue();
    }
    return lazyable;
}
/**
 * @internal
 */
export async function resolveAsyncLazyable<TValue>(
    lazyable: AsyncLazyable<TValue>,
): Promise<TValue> {
    if (typeof lazyable === "function") {
        const getValue = lazyable as () => Promise<TValue>;
        return getValue();
    }
    if (lazyable instanceof LazyPromise) {
        return await lazyable;
    }
    return lazyable;
}

/**
 * @internal
 */
export function isObjectEmpty(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: Record<string | number | symbol, any>,
): boolean {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [...Object.values(object)].filter((value) => value !== undefined)
            .length === 0
    );
}

/**
 * @internal
 */
export function resolveOneOrMoreStr(name: OneOrMore<string>): string {
    if (Array.isArray(name)) {
        name = name.filter((str) => str.length > 0).join("/");
    }
    return name;
}

/**
 * @internal
 */
export function getConstructorName(instance: object): string {
    return instance.constructor.name;
}

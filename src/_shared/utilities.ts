/**
 * @module Shared
 */

import type { Lazyable } from "@/_shared/types";
import { type AsyncLazyable } from "@/_shared/types";

/**
 * @internal
 */
export function simplifyLazyable<TValue>(lazyable: Lazyable<TValue>): TValue {
    if (typeof lazyable === "function") {
        const getValue = lazyable as () => TValue;
        return getValue();
    }
    return lazyable;
}
/**
 * @internal
 */
export async function simplifyAsyncLazyable<TValue>(
    lazyable: AsyncLazyable<TValue>,
): Promise<TValue> {
    if (typeof lazyable === "function") {
        const getValue = lazyable as () => Promise<TValue>;
        return getValue();
    }
    return lazyable;
}
/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isArrayEmpty(array: any[]): boolean {
    return array.length === 0;
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

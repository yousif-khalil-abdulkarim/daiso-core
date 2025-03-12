/**
 * @module Utilities
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type {
    AsyncLazyable,
    Lazyable,
    Lazy,
    AsyncLazy,
} from "@/utilities/types/_module.js";
import { resolveInvokable } from "@/utilities/functions/invokable.js";

/**
 * @internal
 */
export function isLazy<TValue>(
    lazyable: Lazyable<TValue>,
): lazyable is Lazy<TValue> {
    return typeof lazyable === "function";
}

/**
 * @internal
 */
export function resolveLazyable<TValue>(lazyable: Lazyable<TValue>): TValue {
    if (isLazy(lazyable)) {
        return resolveInvokable(lazyable)();
    }
    return lazyable;
}

/**
 * @internal
 */
export function isAsyncLazy<TValue>(
    lazyable: AsyncLazyable<TValue>,
): lazyable is AsyncLazy<TValue> {
    return typeof lazyable === "function" || lazyable instanceof LazyPromise;
}

/**
 * @internal
 */
export async function resolveAsyncLazyable<TValue>(
    lazyable: AsyncLazyable<TValue>,
): Promise<TValue> {
    if (isAsyncLazy(lazyable)) {
        if (lazyable instanceof LazyPromise) {
            return await lazyable;
        }
        return await resolveInvokable(lazyable)();
    }
    return lazyable;
}

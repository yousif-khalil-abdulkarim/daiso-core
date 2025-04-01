/**
 * @module Utilities
 */

import type { LazyPromise } from "@/async/utilities/_module.js";
import type {
    AsyncLazyable,
    Lazyable,
    Lazy,
    AsyncLazy,
} from "@/utilities/types/_module.js";
import {
    isInvokable,
    resolveInvokable,
} from "@/utilities/functions/invokable.js";

/**
 * @internal
 */
export function isLazy<TValue>(
    lazyable: Lazyable<TValue>,
): lazyable is Lazy<TValue> {
    return isInvokable(lazyable);
}

/**
 * @internal
 */
export function isLazyPromise<TValue>(
    lazyable: AsyncLazyable<TValue>,
): lazyable is LazyPromise<TValue> {
    return (
        typeof lazyable === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof (lazyable as any)?.then === "function" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof (lazyable as any)?.defer === "function"
    );
}

/**
 * @internal
 */
export function isAsyncLazy<TValue>(
    lazyable: AsyncLazyable<TValue>,
): lazyable is AsyncLazy<TValue> {
    return isInvokable(lazyable) || isLazyPromise(lazyable);
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
export async function resolveAsyncLazyable<TValue>(
    lazyable: AsyncLazyable<TValue>,
): Promise<TValue> {
    if (isAsyncLazy(lazyable)) {
        if (isLazyPromise(lazyable)) {
            return await lazyable;
        }
        return await resolveInvokable(lazyable)();
    }
    return lazyable;
}

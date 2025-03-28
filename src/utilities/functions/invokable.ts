/**
 * @module Utilities
 */

import type {
    Invokable,
    InvokableFn,
    IInvokableObject,
} from "@/utilities/types/_module.js";
import { isNullable } from "@/utilities/functions/is-nullable.js";

/**
 * @internal
 */
export function isInvokableObject<TValue, TArgs extends unknown[], TReturn>(
    invokable: TValue | Invokable<TArgs, TReturn>,
): invokable is IInvokableObject<TArgs, TReturn> {
    const invokable_ = invokable as Record<string, unknown>;
    return !isNullable(invokable) && typeof invokable_["invoke"] === "function";
}

/**
 * @internal
 */
export function isInvokableFn<TValue, TArgs extends unknown[], TReturn>(
    invokable: TValue | Invokable<TArgs, TReturn>,
): invokable is InvokableFn<TArgs, TReturn> {
    return typeof invokable === "function";
}

/**
 * @internal
 */
export function isInvokable<TValue, TArgs extends unknown[], TReturn>(
    invokable: TValue | Invokable<TArgs, TReturn>,
): invokable is Invokable<TArgs, TReturn> {
    return isInvokableObject(invokable) || isInvokableFn(invokable);
}

/**
 * @internal
 */
export function resolveInvokable<TArgs extends unknown[], TReturn>(
    invokable: Invokable<TArgs, TReturn>,
): InvokableFn<TArgs, TReturn> {
    if (isInvokableObject(invokable)) {
        return (...args) => invokable.invoke(...args);
    }
    return (...args) => invokable(...args);
}

/**
 * @internal
 */
export function callInvokable<TArgs extends unknown[], TReturn>(
    invokable: Invokable<TArgs, TReturn>,
    ...args: TArgs
): TReturn {
    if (isInvokableObject(invokable)) {
        return invokable.invoke(...args);
    }
    return invokable(...args);
}

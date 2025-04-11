/**
 * @module Utilities
 */

import type {
    Invokable,
    InvokableFn,
    IInvokableObject,
} from "@/utilities/types/_module.js";
import { isNullable } from "@/utilities/functions/is-nullable.js";
import { getConstructorName } from "@/utilities/functions/get-constructor-name.js";

/**
 * @internal
 */
export function isInvokableObject<
    TValue,
    TParameters extends unknown[],
    TReturn,
>(
    invokable: TValue | Invokable<TParameters, TReturn>,
): invokable is IInvokableObject<TParameters, TReturn> {
    const invokable_ = invokable as Record<string, unknown>;
    return !isNullable(invokable) && typeof invokable_["invoke"] === "function";
}

/**
 * @internal
 */
export function isInvokableFn<TValue, TParameters extends unknown[], TReturn>(
    invokable: TValue | Invokable<TParameters, TReturn>,
): invokable is InvokableFn<TParameters, TReturn> {
    return typeof invokable === "function";
}

/**
 * @internal
 */
export function isInvokable<TValue, TParameters extends unknown[], TReturn>(
    invokable: TValue | Invokable<TParameters, TReturn>,
): invokable is Invokable<TParameters, TReturn> {
    return isInvokableObject(invokable) || isInvokableFn(invokable);
}

/**
 * @internal
 */
export function resolveInvokable<TParameters extends unknown[], TReturn>(
    invokable: Invokable<TParameters, TReturn>,
): InvokableFn<TParameters, TReturn> {
    if (isInvokableObject(invokable)) {
        return (...args) => invokable.invoke(...args);
    }
    return (...args) => invokable(...args);
}

/**
 * @internal
 */
export function callInvokable<TParameters extends unknown[], TReturn>(
    invokable: Invokable<TParameters, TReturn>,
    ...args: TParameters
): TReturn {
    if (isInvokableObject(invokable)) {
        return invokable.invoke(...args);
    }
    return invokable(...args);
}

/**
 * @internal
 */
export function getInvokableName<TParameters extends unknown[], TReturn>(
    invokable: Invokable<TParameters, TReturn>,
): string {
    if (isInvokableFn(invokable)) {
        return invokable.name;
    }
    return getConstructorName(invokable);
}

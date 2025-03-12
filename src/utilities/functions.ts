/**
 * @module Utilities
 */

import { LazyPromise } from "@/async/_module-exports.js";
import { isIterable } from "@/collection/implementations/_shared.js";
import type {
    NEW_FactoryFn,
    NEW_IFactoryObject,
    NEW_Factory,
    NEW_Factoryable,
    NEW_AsyncFactoryFn,
    NEW_IAsyncFactoryObject,
    NEW_AsyncFactory,
    NEW_AsyncFactoryable,
    Invokable,
    InvokableFn,
    NEW_AsyncLazyable,
    NEW_Lazyable,
    OneOrMore,
    NEW_Lazy,
    NEW_AsyncLazy,
} from "@/utilities/types/_module.js";

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

/**
 * @internal
 */
export function getConstructorName(instance: object): string {
    return instance.constructor.name;
}

/**
 * @internal
 */
export function isFactoryFn<TInput, TOutput>(
    factory: NEW_Factoryable<TInput, TOutput>,
): factory is NEW_FactoryFn<TInput, TOutput> {
    return typeof factory === "function";
}

/**
 * @internal
 */
export function isFactoryObject<TInput, TOutput>(
    factory: NEW_Factoryable<TInput, TOutput>,
): factory is NEW_IFactoryObject<TInput, TOutput> {
    return (
        typeof factory === "object" &&
        factory !== null &&
        typeof (factory as Record<string, any>)["use"] === "function"
    );
}

/**
 * @internal
 */
export function resolveFactory<TInput, TOutput>(
    factory: NEW_Factory<TInput, TOutput>,
): NEW_FactoryFn<TInput, TOutput> {
    if (isFactoryObject(factory)) {
        return factory.use.bind(factory);
    }
    return factory;
}

/**
 * @internal
 */
export function isFactory<TInput, TOutput>(
    factoryable: NEW_Factoryable<TInput, TOutput>,
): factoryable is NEW_Factory<TInput, TOutput> {
    return isFactoryFn(factoryable) || isFactoryObject(factoryable);
}

/**
 * @internal
 */
export function resolveFactoryable<TInput, TOutput>(
    factoryable: NEW_Factoryable<TInput, TOutput>,
    input: TInput,
): TOutput {
    if (isFactory(factoryable)) {
        return resolveFactory(factoryable)(input);
    }
    return factoryable;
}

/**
 * @internal
 */
export function isAsyncFactoryFn<TInput, TOutput>(
    factory: NEW_AsyncFactoryable<TInput, TOutput>,
): factory is NEW_AsyncFactoryFn<TInput, TOutput> {
    return typeof factory === "function";
}

/**
 * @internal
 */
export function isAsyncFactoryObject<TInput, TOutput>(
    factory: NEW_AsyncFactoryable<TInput, TOutput>,
): factory is NEW_IAsyncFactoryObject<TInput, TOutput> {
    return (
        typeof factory === "object" &&
        factory !== null &&
        typeof (factory as Record<string, any>)["use"] === "function"
    );
}

/**
 * @internal
 */
export function resolveAsyncFactory<TInput, TOutput>(
    factory: NEW_AsyncFactory<TInput, TOutput>,
): NEW_AsyncFactoryFn<TInput, TOutput> {
    if (isAsyncFactoryObject(factory)) {
        return factory.use.bind(factory);
    }
    return factory;
}

/**
 * @internal
 */
export function isAsyncFactory<TInput, TOutput>(
    factoryable: NEW_AsyncFactoryable<TInput, TOutput>,
): factoryable is NEW_AsyncFactory<TInput, TOutput> {
    return isAsyncFactoryFn(factoryable) || isAsyncFactoryObject(factoryable);
}

/**
 * @internal
 */
export async function resolveAsyncFactoryable<TInput, TOutput>(
    factoryable: NEW_AsyncFactoryable<TInput, TOutput>,
    input: TInput,
): Promise<TOutput> {
    if (isAsyncFactory(factoryable)) {
        return await resolveAsyncFactory(factoryable)(input);
    }
    return factoryable;
}

/**
 * @internal
 */
export function resolveInvokable<TArgs extends unknown[], TReturn>(
    invokable: Invokable<TArgs, TReturn>,
): InvokableFn<TArgs, TReturn> {
    if (typeof invokable === "function") {
        return invokable;
    }
    return invokable.invoke.bind(invokable);
}

/**
 * @internal
 */
export function isLazy<TValue>(
    lazyable: NEW_Lazyable<TValue>,
): lazyable is NEW_Lazy<TValue> {
    return typeof lazyable === "function";
}

/**
 * @internal
 */
export function resolveLazyable<TValue>(
    lazyable: NEW_Lazyable<TValue>,
): TValue {
    if (isLazy(lazyable)) {
        return lazyable();
    }
    return lazyable;
}

/**
 * @internal
 */
export function isAsyncLazy<TValue>(
    lazyable: NEW_AsyncLazyable<TValue>,
): lazyable is NEW_AsyncLazy<TValue> {
    return typeof lazyable === "function" || lazyable instanceof LazyPromise;
}

/**
 * @internal
 */
export async function resolveAsyncLazyable<TValue>(
    lazyable: NEW_AsyncLazyable<TValue>,
): Promise<TValue> {
    if (isAsyncLazy(lazyable)) {
        if (lazyable instanceof LazyPromise) {
            return await lazyable;
        }
        return await lazyable();
    }
    return lazyable;
}

/**
 * @internal
 */
export function removeUndefinedProperties<
    TObject extends Partial<Record<string, unknown>>,
>(object: TObject): TObject {
    return Object.fromEntries(
        Object.entries(object).filter(([_key, value]) => value !== undefined),
    ) as TObject;
}

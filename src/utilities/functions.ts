/**
 * @module Utilities
 */

import { LazyPromise } from "@/async/_module-exports.js";
import { isIterable } from "@/collection/implementations/_shared.js";
import type {
    FactoryFn,
    IFactoryObject,
    Factory,
    Factoryable,
    AsyncFactoryFn,
    IAsyncFactoryObject,
    AsyncFactory,
    AsyncFactoryable,
    Invokable,
    InvokableFn,
    AsyncLazyable,
    Lazyable,
    OneOrMore,
    Lazy,
    AsyncLazy,
    IInvokableObject,
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
    factory: Factoryable<TInput, TOutput>,
): factory is FactoryFn<TInput, TOutput> {
    return typeof factory === "function";
}

/**
 * @internal
 */
export function isFactoryObject<TInput, TOutput>(
    factory: Factoryable<TInput, TOutput>,
): factory is IFactoryObject<TInput, TOutput> {
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
    factory: Factory<TInput, TOutput>,
): FactoryFn<TInput, TOutput> {
    if (isFactoryObject(factory)) {
        return factory.use.bind(factory);
    }
    return factory;
}

/**
 * @internal
 */
export function isFactory<TInput, TOutput>(
    factoryable: Factoryable<TInput, TOutput>,
): factoryable is Factory<TInput, TOutput> {
    return isFactoryFn(factoryable) || isFactoryObject(factoryable);
}

/**
 * @internal
 */
export function resolveFactoryable<TInput, TOutput>(
    factoryable: Factoryable<TInput, TOutput>,
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
    factory: AsyncFactoryable<TInput, TOutput>,
): factory is AsyncFactoryFn<TInput, TOutput> {
    return typeof factory === "function";
}

/**
 * @internal
 */
export function isAsyncFactoryObject<TInput, TOutput>(
    factory: AsyncFactoryable<TInput, TOutput>,
): factory is IAsyncFactoryObject<TInput, TOutput> {
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
    factory: AsyncFactory<TInput, TOutput>,
): AsyncFactoryFn<TInput, TOutput> {
    if (isAsyncFactoryObject(factory)) {
        return factory.use.bind(factory);
    }
    return factory;
}

/**
 * @internal
 */
export function isAsyncFactory<TInput, TOutput>(
    factoryable: AsyncFactoryable<TInput, TOutput>,
): factoryable is AsyncFactory<TInput, TOutput> {
    return isAsyncFactoryFn(factoryable) || isAsyncFactoryObject(factoryable);
}

/**
 * @internal
 */
export async function resolveAsyncFactoryable<TInput, TOutput>(
    factoryable: AsyncFactoryable<TInput, TOutput>,
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
export function isInvokableObject<TValue, TArgs extends unknown[], TReturn>(
    invokable: TValue | Invokable<TArgs, TReturn>,
): invokable is IInvokableObject<TArgs, TReturn> {
    const invokable_ = invokable as Record<string, unknown>;
    return typeof invokable_["invoke"] === "function";
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
        return invokable.invoke.bind(invokable);
    }
    return invokable;
}

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

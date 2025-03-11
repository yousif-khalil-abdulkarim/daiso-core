/**
 * @module Utilities
 */

import { LazyPromise } from "@/async/_module-exports.js";
import { isIterable } from "@/collection/implementations/_shared.js";
import type {
    Factory,
    Factoryable,
    FactoryFn,
    IFactoryObject,
    Invokable,
    InvokableFn,
    Lazyable,
    OneOrMore,
} from "@/utilities/types/_module.js";
import { type AsyncLazyable } from "@/utilities/types/_module.js";

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
export function isFactory<TInput, TOutput>(
    factoryable: Factoryable<TInput, TOutput>,
): factoryable is Factory<TInput, TOutput> {
    return isFactoryFn(factoryable) || isFactoryObject(factoryable);
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
export async function resolveFactoryable<TInput, TOutput>(
    factoryable: Factoryable<TInput, TOutput>,
    input: TInput,
): Promise<TOutput> {
    if (isFactory(factoryable)) {
        const factory = resolveFactory(factoryable);
        return await factory(input);
    } else {
        return factoryable;
    }
}

/**
 * @internal
 */
export function resolveInvokable<TInput, TOutput>(
    invokable: Invokable<TInput, TOutput>,
): InvokableFn<TInput, TOutput> {
    if (typeof invokable === "function") {
        return invokable;
    }
    return invokable.invoke.bind(invokable);
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

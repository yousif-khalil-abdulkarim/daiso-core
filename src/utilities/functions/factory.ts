/**
 * @module Utilities
 */

import type {
    FactoryFn,
    IFactoryObject,
    Factory,
    Factoryable,
    AsyncFactoryFn,
    IAsyncFactoryObject,
    AsyncFactory,
    AsyncFactoryable,
} from "@/utilities/types/_module.js";

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
export function isAsyncFactory<TInput, TOutput>(
    factoryable: AsyncFactoryable<TInput, TOutput>,
): factoryable is AsyncFactory<TInput, TOutput> {
    return isAsyncFactoryFn(factoryable) || isAsyncFactoryObject(factoryable);
}

/**
 * @internal
 */
export function resolveFactory<TInput, TOutput>(
    factory: Factory<TInput, TOutput>,
): FactoryFn<TInput, TOutput> {
    if (isFactoryObject(factory)) {
        return (value) => factory.use(value);
    }
    return factory;
}

/**
 * @internal
 */
export function resolveAsyncFactory<TInput, TOutput>(
    factory: AsyncFactory<TInput, TOutput>,
): AsyncFactoryFn<TInput, TOutput> {
    if (isAsyncFactoryObject(factory)) {
        return (value) => factory.use(value);
    }
    return (value) => factory(value);
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
export async function resolveAsyncFactoryable<TInput, TOutput>(
    factoryable: AsyncFactoryable<TInput, TOutput>,
    input: TInput,
): Promise<TOutput> {
    if (isAsyncFactory(factoryable)) {
        return await resolveAsyncFactory(factoryable)(input);
    }
    return factoryable;
}

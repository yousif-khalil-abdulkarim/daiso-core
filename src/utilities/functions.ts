/**
 * @module Utilities
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type {
    Factory,
    Factoryable,
    FactoryFn,
    IFactoryObject,
    Lazyable,
    OneOrMore,
} from "@/utilities/types.js";
import { type AsyncLazyable } from "@/utilities/types.js";

/**
 * @internal
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export function resolveOneOrMoreStr(
    name: OneOrMore<string>,
    joinStr = "/",
): string {
    if (Array.isArray(name)) {
        name = name.filter((str) => str.length > 0).join(joinStr);
    }
    return name;
}

/**
 * @internal
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export function getConstructorName(instance: object): string {
    return instance.constructor.name;
}

/**
 * @internal
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export function isFactoryFn<TInput, TOutput>(
    factory: Factoryable<TInput, TOutput>,
): factory is FactoryFn<TInput, TOutput> {
    return typeof factory === "function";
}

/**
 * @internal
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export function isFactory<TInput, TOutput>(
    factoryable: Factoryable<TInput, TOutput>,
): factoryable is Factory<TInput, TOutput> {
    return isFactoryFn(factoryable) || isFactoryObject(factoryable);
}

/**
 * @internal
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
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

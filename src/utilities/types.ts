/**
 * @module Utilities
 */

import type { LazyPromise } from "@/async/_module-exports.js";

export type Items<TArray extends any[]> = TArray[number];
/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AtLeastOne<TItem> = [TItem, ...TItem[]];

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type OneOrMore<TItem> = TItem | AtLeastOne<TItem> | Iterable<TItem>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Lazyable<TValue> = TValue | (() => TValue);

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Promisable<TValue> = TValue | PromiseLike<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type LazyPromiseable<TValue> =
    | LazyPromise<TValue>
    | (() => Promisable<TValue>);

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AsyncLazyable<TValue> = TValue | LazyPromiseable<TValue>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Result<TValue, TError> = [TValue, null] | [null, TError];

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AsyncIterableValue<TInput> =
    | Iterable<TInput>
    | AsyncIterable<TInput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AnyFunction = (...parameters: unknown[]) => unknown;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NoneFunction<TType> = Exclude<TType, AnyFunction>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Func<TArgs extends unknown[], TReturn> = (
    ...args_: TArgs
) => TReturn;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type GetOrAddValue<TValue> = Awaited<
    TValue extends AnyFunction ? ReturnType<TValue> : TValue
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type InvokableFn<TInput = unknown, TOutput = unknown> = (
    value: TInput,
) => Promisable<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type IInvokableObject<TInput = unknown, TOutput = unknown> = {
    invoke(value: TInput): Promisable<TOutput>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Invokable<TInput = unknown, TOutput = unknown> =
    | InvokableFn<TInput, TOutput>
    | IInvokableObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type FactoryFn<TInput, TOutput> = (
    value: TInput,
) => Promisable<NoneFunction<TOutput>>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type IFactoryObject<TInput, TOutput> = {
    use(value: TInput): Promisable<NoneFunction<TOutput>>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Factory<TInput, TOutput> =
    | FactoryFn<TInput, TOutput>
    | IFactoryObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Factoryable<TInput, TOutput> =
    | NoneFunction<TOutput>
    | Factory<TInput, TOutput>;

/**
 * @module Utilities
 */

import type { LazyPromise } from "@/async/_module-exports.js";

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type OneOrMore<TItem> = TItem | [TItem, ...TItem[]];

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type Lazyable<TValue> = TValue | (() => TValue);

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type Promisable<TValue> = TValue | PromiseLike<TValue>;

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type LazyPromiseable<TValue> =
    | LazyPromise<TValue>
    | (() => Promisable<TValue>);

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type AsyncLazyable<TValue> = TValue | LazyPromiseable<TValue>;

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type Result<TValue, TError> = [TValue, null] | [null, TError];

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type AsyncIterableValue<TInput> =
    | Iterable<TInput>
    | AsyncIterable<TInput>;

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type AnyFunction = (...parameters: unknown[]) => unknown;

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type Func<TArgs extends unknown[], TReturn> = (
    ...args_: TArgs
) => TReturn;

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type GetOrAddValue<TValue> = Awaited<
    TValue extends AnyFunction ? ReturnType<TValue> : TValue
>;

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type InvokableFn<TInput = unknown, TOutput = unknown> = (
    value: TInput,
) => Promisable<TOutput>;

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type IInvokableObject<TInput = unknown, TOutput = unknown> = {
    invoke(value: TInput): Promisable<TOutput>;
};

/**
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 * @group Contracts
 */
export type Invokable<TInput = unknown, TOutput = unknown> =
    | InvokableFn<TInput, TOutput>
    | IInvokableObject<TInput, TOutput>;

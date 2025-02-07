/**
 * @module Utilities
 */

import type { LazyPromise } from "@/_module";

export type OneOrMore<TItem> = TItem | [TItem, ...TItem[]];

export type Lazyable<TValue> = TValue | (() => TValue);

export type Promisable<TValue> = TValue | PromiseLike<TValue>;

export type AsyncLazyable<TValue> =
    | TValue
    | LazyPromise<TValue>
    | (() => Promisable<TValue>);

export type Result<TValue, TError> = [TValue, null] | [null, TError];

export type AsyncIterableValue<TInput> =
    | Iterable<TInput>
    | AsyncIterable<TInput>;

export type AnyFunction = (...parameters: unknown[]) => unknown;

export type Func<TArgs extends unknown[], TReturn> = (
    ...args_: TArgs
) => TReturn;

export type GetOrAddValue<TValue> = Awaited<
    TValue extends AnyFunction ? ReturnType<TValue> : TValue
>;

export type LazyPromiseable<TValue> =
    | (() => PromiseLike<TValue>)
    | LazyPromise<TValue>;

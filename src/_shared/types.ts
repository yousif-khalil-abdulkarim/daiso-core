/**
 * @module Shared
 */

export type EnsureType<TValue, TType> =
    Exclude<TValue, TType> extends never ? TValue : never;

export type RecordItem<TKey, TValue> = [key: TKey, value: TValue];

export type Lazyable<TValue> = TValue | (() => TValue);
export type Promisable<TValue> = TValue | Promise<TValue>;
export type AsyncLazyable<TValue> = TValue | (() => Promisable<TValue>);

export type AsyncIterableValue<TInput> =
    | Iterable<TInput>
    | AsyncIterable<TInput>;

export type AnyFunction = (...parameters: unknown[]) => unknown;

export type IInitizable = {
    init(): Promise<void>;
};
export type Func<TArgs extends unknown[], TReturn> = (
    ...args_: TArgs
) => TReturn;

export type GetOrAddValue<TValue> = Awaited<
    TValue extends AnyFunction ? ReturnType<TValue> : TValue
>;
export type GetOrAddResult<TValue> = {
    value: TValue;
    hasKey: boolean;
};

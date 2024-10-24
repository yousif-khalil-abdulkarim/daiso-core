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

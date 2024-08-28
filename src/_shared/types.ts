export type EnsureType<TValue, TType> =
    Exclude<TValue, TType> extends never ? TValue : never;

export type RecordItem<TKey, TValue> = [key: TKey, value: TValue];

export type Lazyable<TValue> = TValue | (() => TValue);
export type AsyncLazyable_<TValue> = TValue | (() => Promise<TValue>);
export type AsyncLazyable<TValue> = AsyncLazyable_<TValue> | Lazyable<TValue>;

export type AsyncIterableValue<TInput> =
    | Iterable<TInput>
    | AsyncIterable<TInput>;

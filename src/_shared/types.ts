export type EnsureType<TValue, TType> =
    Exclude<TValue, TType> extends never ? TValue : never;

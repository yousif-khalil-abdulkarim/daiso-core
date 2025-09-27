---
"@daiso-tech/core": minor
---

Updated `ICacheBase` contract to not use `OneOrMore` types as keys meaning you cannot pass in an iterable of string as a key.

`ICacheBase` contract before:

```ts
export type ICacheBase<TType = unknown> = {
    exists(key: OneOrMore<string>): LazyPromise<boolean>;

    missing(key: OneOrMore<string>): LazyPromise<boolean>;

    get(key: OneOrMore<string>): LazyPromise<TType | null>;

    getOrFail(key: OneOrMore<string>): LazyPromise<TType>;

    getAndRemove(key: OneOrMore<string>): LazyPromise<TType | null>;

    getOr(
        key: OneOrMore<string>,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): LazyPromise<TType>;

    getOrAdd(
        key: OneOrMore<string>,
        valueToAdd: AsyncLazyable<NoneFunc<TType>>,
        ttl?: ITimeSpan | null,
    ): LazyPromise<TType>;

    add(
        key: OneOrMore<string>,
        value: TType,
        ttl?: ITimeSpan | null,
    ): LazyPromise<boolean>;

    put(
        key: OneOrMore<string>,
        value: TType,
        ttl?: ITimeSpan | null,
    ): LazyPromise<boolean>;

    update(key: OneOrMore<string>, value: TType): LazyPromise<boolean>;

    increment(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    decrement(
        key: OneOrMore<string>,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    remove(key: OneOrMore<string>): LazyPromise<boolean>;

    removeMany(keys: Iterable<OneOrMore<string>>): LazyPromise<boolean>;

    clear(): LazyPromise<void>;
};
```

`ICacheBase` contract after:

```ts
export type ICacheBase<TType = unknown> = {
    exists(key: string): LazyPromise<boolean>;

    missing(key: string): LazyPromise<boolean>;

    get(key: string): LazyPromise<TType | null>;

    getOrFail(key: string): LazyPromise<TType>;

    getAndRemove(key: string): LazyPromise<TType | null>;

    getOr(
        key: string,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): LazyPromise<TType>;

    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<NoneFunc<TType>>,
        ttl?: ITimeSpan | null,
    ): LazyPromise<TType>;

    add(
        key: string,
        value: TType,
        ttl?: ITimeSpan | null,
    ): LazyPromise<boolean>;

    put(
        key: string,
        value: TType,
        ttl?: ITimeSpan | null,
    ): LazyPromise<boolean>;

    update(key: string, value: TType): LazyPromise<boolean>;

    increment(
        key: string,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    decrement(
        key: string,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    remove(key: string): LazyPromise<boolean>;

    removeMany(keys: Iterable<string>): LazyPromise<boolean>;

    clear(): LazyPromise<void>;
};
```

---
"@daiso-tech/core": minor
---

Update the `IDatabaseLockAdapter` contract.

before:

```ts
export type IDatabaseLockAdapter = {
    insert(key: string, owner: string, expiration: Date | null): Promise<void>;

    updateIfExpired(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<number>;

    remove(key: string): Promise<ILockExpirationData | null>;

    removeIfOwner(key: string, owner: string): Promise<ILockData | null>;

    updateExpirationIfOwner(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number>;

    find(key: string): Promise<ILockData | null>;
};
```

after:

```ts
export type IDatabaseLockAdapter = {
    transaction<TReturn>(
        fn: InvokableFn<
            [transaction: IDatabaseLockTransaction],
            Promise<TReturn>
        >,
    ): Promise<TReturn>;

    remove(key: string): Promise<ILockExpirationData | null>;

    removeIfOwner(key: string, lockId: string): Promise<ILockData | null>;

    updateExpiration(
        key: string,
        lockId: string,
        expiration: Date,
    ): Promise<number>;

    find(key: string): Promise<ILockData | null>;
};
```

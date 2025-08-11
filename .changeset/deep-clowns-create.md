---
"@daiso-tech/core": minor
---

Updated `IDatabaseLockAdapter` contract.

Before update:

```ts
export type ILockData = {
    owner: string;
    expiration: Date | null;
};

export type IDatabaseLockAdapter = {
    insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<void>;

    update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<number>;

    remove(key: string, owner: string | null): PromiseLike<void>;

    refresh(key: string, owner: string, expiration: Date): PromiseLike<number>;

    find(key: string): PromiseLike<ILockData | null>;
};
```

After update:

```ts
export type ILockExpirationData = {
    expiration: Date | null;
};

export type ILockData = ILockExpirationData & {
    owner: string;
};

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

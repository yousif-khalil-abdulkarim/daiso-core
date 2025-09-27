---
"@daiso-tech/core": minor
---

Update the `ILockAdapter` contract.

before:

```ts
export type ILockAdapter = {
    acquire(key: string, owner: string, ttl: TimeSpan | null): Promise<boolean>;

    release(key: string, owner: string): Promise<boolean>;

    forceRelease(key: string): Promise<boolean>;

    refresh(
        key: string,
        owner: string,
        ttl: TimeSpan,
    ): Promise<LockRefreshResult>;
};
```

after:

```ts
export type ILockAdapter = {
    acquire(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean>;

    release(key: string, lockId: string): Promise<boolean>;

    forceRelease(key: string): Promise<boolean>;

    refresh(key: string, lockId: string, ttl: TimeSpan): Promise<boolean>;

    getState(key: string): Promise<ILockAdapterState | null>;
};
```

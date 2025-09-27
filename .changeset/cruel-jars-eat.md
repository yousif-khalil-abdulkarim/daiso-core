---
"@daiso-tech/core": minor
---

Updated `LockProviderCreateSettings` type.

before:
```ts
export type LockProviderCreateSettings = {
    ttl?: TimeSpan | null;

    owner?: OneOrMore<string>;
};
```

after:
```ts
export type LockProviderCreateSettings = {
    ttl?: TimeSpan | null;

    lockId?: string;
};
```
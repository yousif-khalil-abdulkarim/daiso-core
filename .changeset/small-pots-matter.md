---
"@daiso-tech/core": patch
---

Updated `RedisCircuitBreakerAdapterSettings`:

before:
```ts
export type RedisCircuitBreakerAdapterSettings = {
    database: Redis;

    backoff?: BackoffSettingsEnum;

    policy?: CircuitBreakerPolicySettingsEnum;
};
```

now:
```ts
export type RedisCircuitBreakerAdapterSettings = {
    database: Redis;

    backoffPolicy?: BackoffSettingsEnum;

    circuitBreakerPolicy?: CircuitBreakerPolicySettingsEnum;
};
```

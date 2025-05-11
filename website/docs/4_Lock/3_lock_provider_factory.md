---
sidebar_position: 3
---

# LockProvider factory

## Initial configuration

To begin using the [`ILockProviderFactory`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockProviderFactory.html), You will need to register all required adapters during initialization.

```ts
import { LockProviderFactory } from "@daiso-tech/core/lock";
import {
    MemoryLockAdapter,
    RedisLockAdapter,
} from "@daiso-tech/core/lock/adapters";
import { Serde } from "@daiso-tech/core/serde";
import type { ISerde } from "@daiso-tech/core/serde/contracts";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { Namespace } from "@daiso-tech/core/utilities";
import Redis from "ioredis";

const serde = new Serde(new SuperJsonSerdeAdapter());
const lockProvider = new LockProviderFactory({
    // The LockProviderFactory takes the same settings as EventBus class
    namespace: new Namespace("lock"),
    adapters: {
        memory: new MemoryLockAdapter(),
        redis: new RedisLockAdapter(new Redis("YOUR_REDIS_CONNECTION")),
    },
    // You can set the default adapter
    defaultAdapter: "memory",
});
```

## Usage examples

### 1. Using the default adapter

```ts
await lockProvider
    .use()
    .create("shared-resource")
    .run(async () => {
        // code to run
    });
```

:::danger
Note that if you dont set a default adapter, an error will be thrown.
:::

### 2. Specifying an adapter explicitly

```ts
await lockProvider
    .use("redis")
    .create("shared-resource")
    .run(async () => {
        // code to run
    });
```

:::danger
Note that if you specify a non-existent adapter, an error will be thrown.
:::

### 3. Overriding default settings

```ts
await lockProvider
    .setNamespace(new Namespace("@my-namespace"))
    .use("redis")
    .create("shared-resource")
    .run(async () => {
        // code to run
    });
```

:::info
Note that the [`LockProviderFactory`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProviderFactory.html) is immutable, meaning any configuration override returns a new instance rather than modifying the existing one.
:::

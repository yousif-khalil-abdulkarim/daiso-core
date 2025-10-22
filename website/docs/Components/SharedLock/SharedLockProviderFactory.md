# SharedLockProviderFactory

The `SharedLockProviderFactory` class provides a flexible way to configure and switch between different shared-lock adapters at runtime.

## Initial configuration

To begin using the `ISharedLockProviderFactory`, You will need to register all required adapters during initialization.

```ts
import { SharedLockProviderFactory } from "@daiso-tech/core/shared-lock";
import {
    MemorySharedLockAdapter,
    RedisSharedLockAdapter,
} from "@daiso-tech/core/shared-lock/adapters";
import { Serde } from "@daiso-tech/core/serde";
import type { ISerde } from "@daiso-tech/core/serde/contracts";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const serde = new Serde(new SuperJsonSerdeAdapter());
const sharedLockProvider = new SharedLockProviderFactory({
    serde,
    adapters: {
        memory: new MemorySharedLockAdapter(),
        redis: new RedisSharedLockAdapter(new Redis("YOUR_REDIS_CONNECTION")),
    },
    // You can set an optional default adapter
    defaultAdapter: "memory",
});
```

## Usage examples

### 1. Using the default adapter

```ts
await sharedLockProvider
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
await sharedLockProvider
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
await sharedLockProvider
    .setNamespace(new Namespace("@my-namespace"))
    .use("redis")
    .create("shared-resource")
    .run(async () => {
        // code to run
    });
```

:::info
Note that the `SharedLockProviderFactory` is immutable, meaning any configuration override returns a new instance rather than modifying the existing one.
:::

## Further information

For further information refer to [`@daiso-tech/core/shared-lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/SharedLock.html) API docs.

---
sidebar_position: 3
---

# Event bus factory

The [`EventBusFactory`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.EventBusFactory.html) class provides a flexible way to configure and switch between different [`IEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBusAdapter.html):s at runtime.

## Initial configuration

To begin using the [`EventBusFactory`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.EventBusFactory.html), You will need to register all required adapters during initialization.

```ts
import {
    type IEventBusAdapter,
    BaseEvent,
} from "@daiso-tech/core/event-bus/contracts";
import { EventBusFactory } from "@daiso-tech/core/event-bus";
import {
    MemoryEventBusAdapter,
    RedisPubSubEventBusAdapter,
} from "@daiso-tech/core/event-bus/adapters";
import { Namespace, type FactoryFn } from "@daiso-tech/core/utilities";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const serde = new Serde(new SuperJsonSerdeAdapter());
const eventBusFactory = new EventBusFactory({
    // The EventBusFactory takes the same settings as EventBus class
    namespace: new Namespace("event-bus"),
    adapters: {
        memory: new MemoryEventBusAdapter(),
        redis: new RedisPubSubEventBusAdapter({
            serde,
            dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
            listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
        }),
    },
    // You can set an optional default adapter
    defaultAdapter: "memory",
});
```

## Usage examples

### 1. Using the default adapter

```ts
await eventBusFactory.use().dispatch("add", { a: 1, b: 2 });
```

:::danger
Note that if you dont set a default adapter, an error will be thrown.
:::

### 2. Specifying an adapter explicitly

```ts
await eventBusFactory.use("redis").dispatch("add", { a: 1, b: 2 });
```

:::danger
Note that if you specify a non-existent adapter, an error will be thrown.
:::

### 3. Overriding default settings

```ts
import { z } from "zod"

await eventBusFactory
    .setNamespace(new Namespace("@my-namespace"))
    // You can overide the event type by calling setEventMapType or setEventMapSchema method again
    .setEventMapType<{
        add: {
            a: 1,
            b: 2
        }
    }>()
    .setEventMapSchema({
        sub: z.object({
            c: z.number(),
            d: z.number(),
        })
    })
    .use("redis")
    .dispatch("sub", {
        c: 1,
        d: 2,
    });
```

:::info
Note that the [`EventBusFactory`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.EventBusFactory.html) is immutable, meaning any configuration override returns a new instance rather than modifying the existing one.
:::

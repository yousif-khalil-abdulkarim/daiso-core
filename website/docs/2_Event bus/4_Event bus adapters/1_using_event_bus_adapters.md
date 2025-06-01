---
sidebar_position: 1
---

# Using event bus adapters

## MemoryEventBusAdapter

To use the [`MemoryEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.MemoryEventBusAdapter.html) you only need to create instance of it.

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";

const eventBusAdapter = new MemoryEventBusAdapter();
```

You can also provide an `EventEmitter` that will be used for dispatching the events in memory:

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventEmitter } from "node:events";

const eventEmitter = new EventEmitter<any>();
const eventBusAdapter = new MemoryEventBusAdapter(eventEmitter);
```

:::info
[`MemoryEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.MemoryEventBusAdapter.html) lets you test your app without external dependencies like `Redis`, ideal for local development, unit tests, integration tests and fast E2E test for the backend application.
:::

## RedisPubSubEventBusAdapter

To use the [`RedisPubSubEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.RedisPubSubEventBusAdapter.html), you'll need to:

1. Install the required dependency: [`ioredis`](https://www.npmjs.com/package/ioredis) package
2. Provide a string serializer ([`ISerde`](docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](docs/Serde/serde_usage) for this purpose

```ts
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const dispatcherClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
const listenerClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());
const eventBusAdapter = new RedisPubSubEventBusAdapter({
    dispatcherClient,
    listenerClient,
    serde,
});
```

:::danger
Note you need to use two separate `Redis` clients:

-   One dedicated to listening/subscribing to events
-   Another dedicated to dispatching/publishing events

In Redis Pub/Sub, a connection becomes blocked while subscribed to channels. This means a single client cannot both publish and subscribe simultaneously.
For more details, refer to the official [Redis Pub/Sub](https://redis.io/docs/latest/develop/interact/pubsub/) documentation.
:::

## NoOpEventBusAdapter

The [`NoOpEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.NoOpEventBusAdapter.html) is a no-operation implementation, it performs no actions when called.

```ts
import { NoOpEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";

const noEventBusAdapter = new NoOpEventBusAdapter();
```

:::info
The [`NoOpEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.NoOpEventBusAdapter.html) is useful when you want to mock out or disable your `EventBus` class.
:::

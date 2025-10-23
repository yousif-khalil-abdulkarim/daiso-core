# EventBus adapters

## Using EventBus adapters

### MemoryEventBusAdapter

To use the `MemoryEventBusAdapter` you only need to create instance of it.

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/memory-event-bus-adapter";

const eventBusAdapter = new MemoryEventBusAdapter();
```

You can also provide an `EventEmitter` that will be used for dispatching the events in memory:

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/memory-event-bus-adapter";
import { EventEmitter } from "node:events";

const eventEmitter = new EventEmitter<any>();
const eventBusAdapter = new MemoryEventBusAdapter(eventEmitter);
```

:::info
`MemoryEventBusAdapter` lets you test your app without external dependencies like `Redis`, ideal for local development, unit tests, integration tests and fast E2E test for the backend application.
:::

### RedisPubSubEventBusAdapter

To use the `RedisPubSubEventBusAdapter`, you'll need to:

1. Install the required dependency: [`ioredis`](https://www.npmjs.com/package/ioredis) package
2. Provide a string serializer ([`ISerde`](../Serde.md))

- We recommend using `SuperJsonSerdeAdapter` for this purpose

```ts
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/redis-pub-sub-event-bus-adapter";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
import Redis from "ioredis";

const client = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());
const eventBusAdapter = new RedisPubSubEventBusAdapter({
    client,
    serde,
});
```

### NoOpEventBusAdapter

The `NoOpEventBusAdapter` is a no-operation implementation, it performs no actions when called.

```ts
import { NoOpEventBusAdapter } from "@daiso-tech/core/event-bus/no-op-event-bus-adapter";

const noEventBusAdapter = new NoOpEventBusAdapter();
```

:::info
The `NoOpEventBusAdapter` is useful when you want to mock out or disable your `EventBus` class.
:::

## Creating EventBus adapters

### Implementing your custom IEventBusAdapter

In order to create an adapter you need to implement the [`IEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBusAdapter.html) contract.

### Testing your custom IEventBusAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`eventBusAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/EventBus.eventBusAdapterTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
// filename: MyEventBusAdapter.test.ts

import { describe, test, beforeEach, expect } from "vitest";
import { eventBusAdapterTestSuite } from "@daiso-tech/core/event-bus/test-utilities";
import { MyEventBusAdapter } from "./MyEventBusAdapter.js";

describe("class: MyEventBusAdapter", () => {
    eventBusAdapterTestSuite({
        createAdapter: () => new MyEventBusAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

### Implementing your custom IEventBus class

In some cases, you may need to implement a custom [`EventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/EventBus.html) class to optimize performance for your specific technology stack. You can then directly implement the [`IEventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBus.html) contract.

### Testing your custom IEventBus class

We provide a complete test suite to verify your custom event bus class implementation. Simply use the [`eventBusTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/EventBus.eventBusTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
// filename: MyEventBus.test.ts

import { describe, test, beforeEach, expect } from "vitest";
import { eventBusTestSuite } from "@daiso-tech/core/event-bus/test-utilities";
import { MyEventBus } from "./MyEventBus.js";

describe("class: EventBus", () => {
    eventBusTestSuite({
        test,
        expect,
        describe,
        beforeEach,
        createEventBus: () => new MyEventBus(),
    });
});
```

## Further information

For further information refer to [`@daiso-tech/core/event-bus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/EventBus.html) API docs.

# Semaphore

The `@daiso-tech/core/semaphore` component provides a way for managing semaphores independent of underlying platform or storage.

## Initial configuration

To begin using the `SemaphoreProvider` class, you'll need to create and configure an instance:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { MemorySemaphoreAdapter } from "@daiso-tech/core/semaphore/memory-semaphore-adapter";
import { SemaphoreProvider } from "@daiso-tech/core/semaphore";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());

const semaphoreProvider = new SemaphoreProvider({
    // You can provide default TTL value
    // If you set it to null it means semaphores will not expire and most be released manually by default.
    defaultTtl: TimeSpan.fromSeconds(2),

    serde,

    // You can choose the adapter to use
    adapter: new MemorySemaphoreAdapter(),
});
```

:::info
Here is a complete list of settings for the [`SemaphoreProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Semaphore.SemaphoreProviderSettingsBase.html) class.
:::

## Semaphore basics

### Creating a semaphore
```ts
const semaphore = semaphoreProvider.create("shared-resource", {
    // You need to define a limit
    limit: 2
});
```

### Acquiring and releasing the semaphore

```ts
// 1 slot will be acquired
if (await semaphore.acquire()) {
    console.log("Acquired");
    try {
        // The concurrent section
    } finally {
        await semaphore.release();
    }
}
else {
    console.log("Unable to acquire");
}

// 2 slots will be acquired
if (await semaphore.acquire()) {
    console.log("Acquired");
    try {
        // The concurrent section
    } finally {
        await semaphore.release();
    }
}
else {
    console.log("Unable to acquire");
}

// Will log false because the limit is reached
console.log(await semaphore.acquire());
```

Alternatively you could write it as follows:

```ts

// 1 slot will be acquired
try {
    console.log("Acquired");
    // This method will throw if the semaphore limit is reached.
    await semaphore.acquireOrFail();
    // The critical section
}
catch {
    console.log("Unable to acquire");
}
finally {
    await semaphore.release();
}

// 2 slots will be acquired
try {
    console.log("Acquired");
    // This method will throw if the semaphore limit is reached.
    await semaphore.acquireOrFail();
    // The critical section
}
catch {
    console.log("Unable to acquire");
}
finally {
    await semaphore.release();
}

// Will throw because the limit is reached
await semaphore.acquireOrFail();
```

:::danger
You need always to wrap the concurrent section with `try-finally` so the semaphore get released when error occurs.
:::

:::danger
Note `Semaphore` class uses `Task` instead of a regular `Promise`. This means you must either await the `Task` or call its `detach` method to run it.
Refer to the [`@daiso-tech/core/task`](../Task.md) documentation for further information.
:::

### Semaphore with custom TTL

You can provide a custom TTL for the semaphore.

```ts
const semaphore = semaphoreProvider.create("shared-resource", {
    // Default TTL is 5min if not overrided
    // If you set it to null it means semaphore will not expire and most be released manually.
    ttl: TimeSpan.fromSeconds(30),
    limit: 2,
});
```

### Checking semaphore state

You can get the semaphore state by using the `getState` method, it returns [`ISemaphoreState`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Semaphore.ISemaphoreState.html).

```ts
import { SEMAPHORE_STATE } from "@daiso-tech/core/semaphore/contracts";

const semaphore = semaphoreProvider.create("shared-resource", {
    limit: 2,
});
const state = await semaphore.getState();

if (state.type === SEMAPHORE_STATE.EXPIRED) {
    console.log("The semaphore doesnt exists");
}

if (state.type === SEMAPHORE_STATE.LIMIT_REACHED) {
    console.log("The limit have been reached and all slots are unavailable");
}

if (state.type === SEMAPHORE_STATE.ACQUIRED) {
    console.log("The semaphore is acquired");
}

if (state.type === SEMAPHORE_STATE.UNACQUIRED) {
    console.log("There are avilable slots but the semaphore is not acquired");
}
```

## Patterns

### Acquire blocking

You can acquire a semaphore at regular intervals until either successful or a specified timeout is reached:

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

const hasAcquired = await semaphore.acquireBlocking({
    // Time to wait 1 minute
    time: TimeSpan.fromMinutes(1),
    // Intervall to try acquire a semaphore
    interval: TimeSpan.fromSeconds(1),
});
if (hasAcquired) {
    try {
        await doWork();
    } finally {
        await semaphore.release();
    }
}
// Will be logged after 1min
console.log("END");
```

:::warning
Note using `acquireBlocking` in a HTTP request handler is discouraged because it blocks the HTTP request handler causing the handler wait until the semaphore becomes available or the timeout is reached. This will delay HTTP request handler to generate response and will make frontend app slow because of HTTP request handler.
:::


### Refreshing semaphores

The semaphore can be refreshed by the current owner before it expires. This is particularly useful for long-running tasks,
instead of setting an excessively long TTL initially, you can start with a shorter one and use the `refresh` method to set the TTL of the semaphore:

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2,
    ttl: TimeSpan.fromMinutes(1),
});

const hasAcquired = await semaphore.acquire();
if (hasAcquired) {
    try {
        while (true) {
            await semaphore.refresh(TimeSpan.fromMinutes(1));
            const hasFinished = await doWork();
            if (hasFinished) {
                break;
            }
            await Task.delay(TimeSpan.fromSeconds(1));
        }
    } finally {
        await semaphore.release();
    }
}
```
:::warning
Note: A semaphore must have an expiration (a `ttl` value) to be refreshed. You cannot refresh a semaphore that was created without an expiration (with `ttl: null`)

```ts
// Create a semaphore with no expiration (non-refreshable)
const semaphore = semaphoreProvider.create("resource", {
    limit: 2,
    ttl: null,
});

// A refresh attempt on this semaphore will fail
const hasRefreshed = await semaphore.refresh();

// This will log 'false' because the semaphore cannot be refreshed
console.log(hasRefreshed);
```
:::

### Additional methods

The `acquireBlockingOrFail` method is the same as `acquireBlocking` method but it throws an error when not enable to acquire the semaphore:

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

await semaphore.acquireBlockingOrFail({
    // You can provide the same configuration as in acquireBlocking method
});
```

The `releaseOrFail` method is the same `release` method but it throws an error when not enable to release the semaphore:

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

await semaphore.releaseOrFail();
```

You can force release all the semaphore slots:

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

await semaphore.forceReleaseAll();
```

The `refreshOrFail` method is the same `refresh` method but it throws an error when not enable to refresh the semaphore:

```ts
const semaphore = semaphoreProvider.create("resource");

await semaphore.refreshOrFail();
```

The `run` method automatically manages semaphore acquisition and release around function execution.
It calls `acquire` before invoking the function and calls `release` in a finally block, ensuring the semaphore is always freed, even if an error occurs during execution.

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

await semaphore.run(async () => {
    await doWork();
});
```

:::info
Note the method returns a [`Result`](../../Utilities/Result%20type.md) type that can be inspected to determine the operation's success or failure.
:::

The `runOrFail` method automatically manages semaphore acquisition and release around function execution.
It calls `acquireOrFail` before invoking the function and calls `release` in a finally block, ensuring the semaphore is always freed, even if an error occurs during execution.

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

await semaphore.runOrFail(async () => {
    await doWork();
});
```

:::info
Note the method throws an error when the semaphore cannot be acquired.
:::

The `runBlocking` method automatically manages semaphore acquisition and release around function execution.
It calls `acquireBlocking` before invoking the function and calls `release` in a finally block, ensuring the semaphore is always freed, even if an error occurs during execution.

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

await semaphore.runBlocking(
    async () => {
        await doWork();
    },
    {
        // You can provide the same configuration as in acquireBlocking method
    },
);
```

:::info
Note the method returns a [`Result`](../../Utilities/Result%20type.md) type that can be inspected to determine the operation's success or failure.
:::

The `runBlockingOrFail` method automatically manages semaphore acquisition and release around function execution.
It calls `acquireBlockingOrFail` before invoking the function and calls `release` in a finally block, ensuring the semaphore is always freed, even if an error occurs during execution.

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

await semaphore.runBlockingOrFail(
    async () => {
        await doWork();
    },
    {
        // You can provide the same configuration as in acquireBlocking method
    },
);
```

:::info
Note the method throws an error when a semaphore cannot be acquired.
:::

:::info
You can provide [`Task`](../Task.md), synchronous and asynchronous `Invokable` as values for `run`, `runOrFail`, `runBlocking` and `runBlockingOrFail` methods.
:::

### Semaphore instance variables

The `Semaphore` class exposes instance variables such as:

```ts
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

// Will return the key of the semaphore which is "resource"
console.log(semaphore.key);

// Will return the id of the semaphore
console.log(semaphore.id);

// Will return the ttl of the semaphore
console.log(semaphore.ttl);
```


### Semaphore slot id

By default the slot id is autogenerated but it can also manually defined.

```ts
const semaphore = semaphoreProvider.create("semaphore", {
    slotId: "my-slot-id",
});

const hasAcquire = await semaphore.acquire();
if (hasAcquired) {
    console.log("Shared resource");
    await semaphore.release();
}
```

:::info
Manually defining slot id is primarily useful for debugging or implementing manual resource controll by the end user.
:::

:::warning
In most cases, setting a slot id is unnecessary.
:::

### Namespacing

You can use the `Namespace` class to group related semaphores without conflicts.

:::info
For further information about namespacing refer to [`@daiso-tech/core/namespace`](../Namespace.md) documentation.
:::

```ts
import { Namespace } from "@daiso-tech/core/namespace";
import { RedisSemaphoreAdapter } from "@daiso-tech/core/semaphore/redis-semaphore-adapter";
import { SemaphoreProvider } from "@daiso-tech/core/semaphore";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());

const semaphoreProviderA = new SemaphoreProvider({
    namespace: new Namespace("@semaphore-a"),
    adapter: new RedisSemaphoreAdapter(database),
    serde,
});
const semaphoreProviderB = new SemaphoreProvider({
    namespace: new Namespace("@semaphore-b"),
    adapter: new RedisSemaphoreAdapter(database),
    serde,
});

const semaphoreA = await semaphoreProviderA.create("key", {
    ttl: null,
    limit: 1
});
const semaphoreB = await semaphoreProviderB.create("key", {
    ttl: null,
    limit: 1
});

const hasAquiredA = await semaphoreA.acquire();
// Will log true
console.log(hasAquiredA);

const hasAquiredB = await semaphoreB.acquire();
// Will log true
console.log(hasAquiredB);

const hasReleasedB = await semaphoreB.release();
// Will log true
console.log(hasReleasedB);

// Will log { type: "ACQUIRED", remainingTime: null }
console.log(await semaphoreA.getState());

// Will log { type: "EXPIRED" }
console.log(await semaphoreB.getState());
```

### Retrying acquiring semaphore

To retry acquiring semaphore you can use the [`retry`](../Resilience.md) middleware with [`Task.pipe`](../Task.md) method.

Retrying acquiring semaphore with `acquireOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireSemaphoreError } from "@daiso-tech/core/semaphore/contracts";

const semaphore = semaphoreProvider.create("semaphore", {
    limit: 2
});

try {
    await semaphore.acquireOrFail().pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireSemaphoreError,
        }),
    );
    // The critical section
} finally {
    await semaphore.release();
}
```

Retrying acquiring semaphore with `acquire` method:

```ts
import { retry } from "@daiso-tech/core/resilience";

const semaphore = semaphoreProvider.create("semaphore", {
    limit: 2
});

const hasAquired = await semaphore.acquire().pipe(
    retry({
        maxAttempts: 4,
        errorPolicy: {
            treatFalseAsError: true,
        },
    }),
);
if (hasAquired) {
    try {
        // The critical section
    } finally {
        await semaphore.release();
    }
}
```

Retrying acquiring semaphore with `runOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireSemaphoreError } from "@daiso-tech/core/semaphore/contracts";

const semaphore = semaphoreProvider.create("semaphore", {
    limit: 2
});

await semaphore
    .runOrFail(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireSemaphoreError,
        }),
    );
```

Retrying acquiring semaphore with `run` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireSemaphoreError } from "@daiso-tech/core/semaphore/contracts";

const semaphore = semaphoreProvider.create("semaphore", {
    limit: 2
});

await semaphore
    .run(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireSemaphoreError,
        }),
    );
```

### Serialization and deserialization of semaphore

Semaphores can be serialized, allowing them to be transmitted over the network to another server and later deserialized for reuse.
This means you can, for example, acquire the semaphore on the main server, transfer it to a queue worker server, and release it there.

Manually serializing and deserializing the semaphore:

```ts
import { RedisSemaphoreAdapter } from "@daiso-tech/core/semaphore/redis-semaphore-adapter";
import { SemaphoreProvider } from "@daiso-tech/core/semaphore";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisClient = new Redis("YOUR_REDIS_CONNECTION");

const semaphoreProvider = new SemaphoreProvider({
    // You can laso pass in an array of Serde class instances
    serde,
    adapter: new RedisSemaphoreAdapter(redisClient),
});

const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});
const serializedSemaphore = serde.serialize(semaphore);
const deserializedSemaphore = serde.deserialize(semaphore);
```

:::danger
When serializing or deserializing a semaphore, you must use the same `Serde` instances that were provided to the `SemaphoreProvider`. This is required because the `SemaphoreProvider` injects custom serialization logic for `ISemaphore` instance into `Serde` instances.
:::

:::info
Note you only need manuall serialization and deserialization when integrating with external libraries.
:::

As long you pass the same `Serde` instances with all other components you dont need to serialize and deserialize the semaphore manually.

```ts
import { RedisSemaphoreAdapter } from "@daiso-tech/core/semaphore/redis-semaphore-adapter";
import type { ISemaphore } from "@daiso-tech/core/semaphore/contracts";
import { SemaphoreProvider } from "@daiso-tech/core/semaphore";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());
const mainRedisClient = new Redis("YOUR_REDIS_CONNECTION");
const listenerRedisClient = new Redis("YOUR_REDIS_CONNECTION");

type EventMap = {
    "sending-semaphore-over-network": {
        semaphore: ISemaphore;
    };
};
const eventBus = new EventBus<EventMap>({
    adapter: new RedisPubSubEventBusAdapter({
        listenerClient,
        dispatcherClient: mainRedisClient,
        serde,
    }),
});

const semaphoreProvider = new SemaphoreProvider({
    serde,
    adapter: new RedisSemaphoreAdapter(mainRedisClient),
    eventBus,
});
const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});

// We are sending the semaphore over the network to other servers.
await eventBus.dispatch("sending-semaphore-over-network", {
    semaphore,
});

// The other servers will recieve the serialized semaphore and automattically deserialize it.
await eventBus.addListener("sending-semaphore-over-network", ({ semaphore }) => {
    // The semaphore is serialized and can be used
    console.log("SEMAPHORE:", semaphore);
});
```

### Semaphore events

You can listen to different [semaphore events](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Semaphore.html) that are triggered by the `Semaphore`.
Refer to the [`EventBus`](../EventBus/index.md) documentation to learn how to use events.

```ts
import { SEMAPHORE_EVENTS } from "@daiso-tech/core/semaphore/contracts";

// Will log whenever an semaphore is acquiured
await semaphoreProvider.subscribe(SEMAPHORE_EVENTS.ACQUIRED, (event) => {
    console.log(event);
});

const semaphore = semaphoreProvider.create("resource", {
    limit: 2
});
await semaphore.acquire();
```

:::info
Note the `Semaphore` class uses [`MemoryEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.MemoryEventBusAdapter.html) by default. You can choose what event bus adapter to use:

```ts
import { MemorySemaphoreAdapter } from "@daiso-tech/core/semaphore/memory-semaphore-adapter";
import { SemaphoreProvider } from "@daiso-tech/core/semaphore";
import { RedisPubSubEventBus } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisPubSubEventBusAdapter = new RedisPubSubEventBusAdapter({
    dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    serde,
});

const semaphore = new SemaphoreProvider({
    adapter: new MemorySemaphoreAdapter(),
    eventBus: new EventBus({
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

:::info
Note you can disable dispatching `Semaphore` events by passing an `EventBus` that uses `NoOpEventBusAdapter`.
:::

:::warning
If multiple semaphore adapters (e.g., `RedisSemaphoreAdapter` and `MemorySemaphoreAdapter`) are used at the same time, isolate their events by assigning separate namespaces. This prevents listeners from unintentionally capturing events across adapters.

```ts
import { MemorySemaphoreAdapter } from "@daiso-tech/core/semaphore/memory-semaphore-adapter";
import { EventBus } from "@daiso-tech/core/event-bus";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";
import { Namespace } from "@daiso-tech/core/namespace";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisPubSubEventBusAdapter = new RedisPubSubEventBusAdapter({
    dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    serde,
});

const memorySemaphoreAdapter = new MemorySemaphoreAdapter();
const memorySemaphoreProvider = new SemaphoreProvider({
    adapter: memorySemaphoreAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemorySemaphoreAdapter and RedisSemaphoreAdapter to isolate their events.
        namespace: new Namespace(["memory-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});

const redisSemaphoreAdapter = new RedisSemaphoreAdapter({
    serde,
    database: new Redis("YOUR_REDIS_CONNECTION_STRING"),
});
const redisSemaphoreProvider = new SemaphoreProvider({
    adapter: redisSemaphoreAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemorySemaphoreAdapter and RedisSemaphoreAdapter to isolate their events.
        namespace: new Namespace(["redis-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

### Seperating creating, listening to and manipulating semaphore

The library includes 3 additional contracts:

- `ISemaphore` - Allows only manipulation of the semaphore.

- `ISemaphoreProviderBase` - Allows only creation of semaphores.

- `ISemaphoreListenable` – Allows only to listening to semaphore events.

This seperation makes it easy to visually distinguish the 3 contracts, making it immediately obvious that they serve different purposes.

```ts
import { MemorySemaphoreAdapter } from "@daiso-tech/core/semaphore/memory-semaphore-adapter";
import {
    type ISemaphore,
    type ISemaphoreProvider,
    type ISemaphoreListenable,
    SEMAPHORE_EVENTS,
} from "@daiso-tech/core/semaphore/contracts";

async function semaphoreFunc(semaphore: ISemaphore): Promise<void> {
    await semaphore.run(async () => {
        await doWork();
    });
}

async function semaphoreProviderFunc(semaphoreProvider: ISemaphoreProvider): Promise<void> {
    // You cannot access the listener methods
    // You will get typescript error if you try

    const semaphore = semaphoreProvider.create("resource", {
        limit: 2
    });
    await semaphoreFunc(semaphore);
}

async function semaphoreListenableFunc(
    semaphoreListenable: ISemaphoreListenable,
): Promise<void> {
    // You cannot access the semaphoreProvider methods
    // You will get typescript error if you try

    await semaphoreListenable.addListener(SEMAPHORE_EVENTS.ACQUIRED, (event) => {
        console.log("ACQUIRED:", event);
    });
    await semaphoreListenable.addListener(SEMAPHORE_EVENTS.RELEASED, (event) => {
        console.log("RELEASED:", event);
    });
}

await semaphoreListenableFunc(semaphoreProvider);
await semaphoreProviderFunc(semaphoreProvider);
```

## Further information

For further information refer to [`@daiso-tech/core/semaphore`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Semaphore.html) API docs.

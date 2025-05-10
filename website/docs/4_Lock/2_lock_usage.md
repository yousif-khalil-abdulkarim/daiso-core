---
sidebar_position: 2
---

# Lock usage

## Initial configuration

To begin using the [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html) class, you'll need to create and configure an instance:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
import { LockProvider } from "@daiso-tech/core/lock";
import { Namespace } from "@daiso-tech/core/utilities";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());

const lockProvider = new LockProvider({
    // You can provide default TTL value
    // If you set it to null it means locks will not expire and most be released manually.
    defaultTtl: TimeSpan.fromSeconds(2),

    serde,

    namespace: new Namespace("lock"),

    // You can choose the adapter to use
    adapter: new MemoryLockAdapter(),
});
```

:::info
Here is a complete list of configuration settings for the [LockProvider](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.LockProviderSettingsBase.html) class.
:::

## Lock basics

### Creating a lock

```ts
const lock = lockProvider.create("shared-resource");
```

### Acquiring and releasing the lock the lock

```ts
const hasAquired = await lockProvider.aquire();
if (hasAquired) {
    try {
        // The critical section
    } finally {
        await lockProvider.release();
    }
}
```

Alternatively you could write it as follows:

```ts
try {
    // This method will throw if the lock is not acquired
    await lockProvider.aquireOrFail();
    // The critical section
} finally {
    await lockProvider.release();
}
```

:::danger
You need always to wrap the critical section with `try-finally` so the lock get released when error occurs.
:::

### Locks with custom TTL

You can provide a custom TTL for the key.

```ts
const lock = lockProvider.create("shared-resource", {
    // Default TTL is 5min if not overrided
    // If you set it to null it means locks will not expire and most be released manually.
    ttl: TimeSpan.fromSeconds(30),
});
```

### Checking lock state

You can check whether the lock has expired. If it has, the lock is available for acquisition:

```ts
await lockProvider.isExpired();
```

You can check whether the lock is in use, in other words acquired:

```ts
await lockProvider.isLocked();
```

You can also get reamining expiration time:

```ts
await lockProvider.getRemainingTime();
```

:::info
Null is returned if the key has no expiration, the key doesnt exist or the key has expired.
:::

## Patterns

### Acquire blocking

You can acquire the lock at regular intervals until either successful or a specified timeout is reached:

```ts
const lock = lockProvider.create("resource");

const hasAcquired = await lock.acquireBlocking({
    // Time to wait 1 minute
    time: TimeSpan.fromMinutes(1),
    // Intervall to try acquire the lock
    interval: TimeSpan.fromSeconds(1),
});
if (hasAcquired) {
    try {
        await doWork();
    } finally {
        await lock.release();
    }
}
// Will be logged after 1min
console.log("END");
```

:::warning
Note using `acquireBlocking` in a HTTP request handler is discouraged because it blocks the HTTP request handler causing the handler wait until the lock becomes available or the timeout is reached. This will delay HTTP request handler to generate response and will make frontend app slow because of HTTP request handler.
:::

### Refreshing locks

The lock can be refreshed by the current owner before it expires. This is particularly useful for long-running tasks,
instead of setting an excessively long TTL initially, you can start with a shorter one and use the `refresh` method to set the TTL of the lock:

```ts
const lock = lockProvider.create("resource", {
    ttl: TimeSpan.fromMinutes(1),
});

const hasAcquired = await lock.aquire();
if (hasAcquired) {
    try {
        while (true) {
            await lock.refresh(TimeSpan.fromMinutes(1));
            const hasFinished = await doWork();
            if (hasFinished) {
                break;
            }
            await LazyPromise.delay(TimeSpan.fromSeconds(1));
        }
    } finally {
        await lock.release();
    }
}
```

### Lock owners

Each lock has a unique owner to identify its holder. For example, if User-A owns the lock, User-B cannot acquire or release it. Only the current owner (User-A) can. User-B may acquire the lock only after it is either explicitly released by User-A or has expired:

```ts
const lockA = lockProvider.create("resource");
const lockB = lockProvider.create("resource");

const promiseA = (async () => {
    const hasAquired = await lockA.acquire();
    if (hasAquired) {
        console.log("A acquired resource");
        // Auto generated
        console.log("Owner", await lockA.getOwner());
        await LazyPromise.delay(TimeSpan.fromSeconds(2));
        await lockA.release();
        console.log("A released resource");
    } else {
        console.log("A failed to acquire resource");
    }
})();
const promiseB = (async () => {
    const hasAquired = await lockB.acquire();
    if (hasAquired) {
        console.log("B acquired resource");
        // Auto generated
        console.log("Owner", await lockB.getOwner());
        await LazyPromise.delay(TimeSpan.fromSeconds(2));
        await lockB.release();
        console.log("B released resource");
    } else {
        console.log("B failed to acquire resource");
    }
})();

// Only one of locks can acquire the resource at a time.
await Promise.all([promiseA, promiseB]);
```

:::info
Note the owner name can be manually specified, primarily for debugging or implementing manual resource locking by the end user.

```ts
const lockA = lockProvider.create("resource", {
    owner: "A",
});
console.log("Owner", await lockA.getOwner());

const lockB = lockProvider.create("resource", {
    owner: "B",
});
console.log("Owner", await lockB.getOwner());
```

Manual end user resource locking is useful in scenarios like a CMS supporting multi-user collaboration, documents should be locked during editing to prevent data corruption. When a user opens a document for editing, the system should automatically set the lock owner name to that user's unique ID. This ensures exclusive access - only the lock owner can modify the document until they release the lock.
:::

:::warning
In most cases, setting a custom owner is unnecessary. Misusing this feature could result in different locks sharing the same owner while modifying the same resource simultaneously, which may lead to race conditions.
:::

### Additional methods

You can get the owner of the lock:

```ts
const lock = lockProvider.create("resource");

await lock.getOwner();
```

The `acquireBlockingOrFail` method is the same as `acquireBlocking` method but it throws an error when not enable to acquire the lock:

```ts
const lock = lockProvider.create("resource");

await lock.acquireBlockingOrFail({
    // You can provide the same configuration as in acquireBlocking method
});
```

The `releaseOrFail` method is the same `release` method but it throws an error when not enable to release the lock:

```ts
const lock = lockProvider.create("resource");

await lock.releaseOrFail();
```

You can force release the lock regardless of its current owner:

```ts
const lock = lockProvider.create("resource");

await lock.forceRelease();
```

The `refreshOrFail` method is the same `refresh` method but it throws an error when not enable to refresh the lock:

```ts
const lock = lockProvider.create("resource");

await lock.refreshOrFail();
```

The `run` method automatically manages lock acquisition and release around function execution.
It calls `acquire` before invoking the function and calls `release` in a finally block, ensuring the lock is always freed, even if an error occurs during execution.

```ts
const lock = lockProvider.create("resource");

await lock.run(async () => {
    await doWork();
});
```

:::info
Note the method returns a [`Result`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Result.html) type that can be inspected to determine the operation's success or failure.
:::

The `runOrFail` method automatically manages lock acquisition and release around function execution.
It calls `acquireOrFail` before invoking the function and calls `release` in a finally block, ensuring the lock is always freed, even if an error occurs during execution.

```ts
const lock = lockProvider.create("resource");

await lock.runOrFail(async () => {
    await doWork();
});
```

:::info
Note the method throws an error when the lock cannot be acquired.
:::

The `runBlocking` method automatically manages lock acquisition and release around function execution.
It calls `acquireBlocking` before invoking the function and calls `release` in a finally block, ensuring the lock is always freed, even if an error occurs during execution.

```ts
const lock = lockProvider.create("resource");

await lock.runBlocking(
    async () => {
        await doWork();
    },
    {
        // You can provide the same configuration as in acquireBlocking method
    },
);
```

:::info
Note the method returns a [`Result`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Result.html) type that can be inspected to determine the operation's success or failure.
:::

The `runBlocking` method automatically manages lock acquisition and release around function execution.
It calls `acquireBlockingOrFail` before invoking the function and calls `release` in a finally block, ensuring the lock is always freed, even if an error occurs during execution.

```ts
const lock = lockProvider.create("resource");

await lock.runBlockingOrFail(
    async () => {
        await doWork();
    },
    {
        // You can provide the same configuration as in acquireBlocking method
    },
);
```

:::info
Note the method throws an error when the lock cannot be acquired.
:::

:::info
You can provide [`LazyPromise`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Async.LazyPromise.html), synchronous and asynchronous [`Invokable`](../7_Utilities/3_invokable.md) as default values for `run`, `runOrFail`, `runBlocking` and `runBlockingOrFail` methods.
:::

### Iterable as key name and owner name

You can use an `Iterable` as a key. The elements will be joined into a single string, and the delimiter used for joining is configurable in the [`Namespace`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.Namespace.html) class:

```ts
const lockProvider = new LockProvider({
    namespace: new Namespace("lock"),
    // rest of the settings ....
});

const lock = lockProvider.create(["resource", "1"], {
    owner: ["user", "1"],
});
```

### Serialization and deserialization of lock

Locks can be serialized, allowing them to be transmitted over the network to another server and later deserialized for reuse.
This means you can, for example, acquire the lock on the main server, transfer it to a queue worker server, and release it there.

Manually serializing and deserializing the lock:

```ts
import { RedisLockAdapter } from "@daiso-tech/core/lock/adapters";
import { LockProvider } from "@daiso-tech/core/lock";
import { Namespace } from "@daiso-tech/core/utilities";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisClient = new Redis("YOUR_REDIS_CONNECTION");

const lockProvider = new LockProvider({
    // You can pass an array of Serde classes
    serde,
    namespace: new Namespace("lock"),
    adapter: new RedisLockAdapter(redisClient),
});

const lock = lockProvider.create("resource");
const serializedLock = serde.serialize(lock);
const deserializedLock = serde.deserialize(lock);
```

:::danger
When serializing or deserializing a lock, you must use the same [`Serde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/interfaces/Serde.IFlexibleSerde.html) (Serializer/Deserializer) instances that were provided to the [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html). This is required because the [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html) injects custom serialization logic for [`ILock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILock.html) instance into [`Serde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/interfaces/Serde.IFlexibleSerde.html) instances.
:::

:::info
Note you only need manuall serialization and deserialization when integrating with external libraries.
:::

As long you pass the same [`Serde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/interfaces/Serde.IFlexibleSerde.html) instances with all other components you dont need to serialize and deserialize the lock manually.

```ts
import { RedisLockAdapter } from "@daiso-tech/core/lock/adapters";
import type { ILock } from "@daiso-tech/core/lock/contracts";
import { LockProvider } from "@daiso-tech/core/lock";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Namespace } from "@daiso-tech/core/utilities";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());
const mainRedisClient = new Redis("YOUR_REDIS_CONNECTION");
const listenerRedisClient = new Redis("YOUR_REDIS_CONNECTION");

type EventMap = {
    "sending-lock-over-network": {
        lock: ILock;
    };
};
const eventBus = new EventBus<EventMap>({
    namespace: new Namespace("event-bus"),
    adapter: new RedisPubSubEventBusAdapter({
        listenerClient,
        dispatcherClient: mainRedisClient,
        serde,
    }),
});

const lockProvider = new LockProvider({
    serde,
    namespace: new Namespace("lock"),
    adapter: new RedisLockAdapter(mainRedisClient),
    eventBus,
});
const lock = lockProvider.create("resource");

// We are sending the lock over the network to other servers.
await eventBus.dispatch("sending-lock-over-network", {
    lock,
});

// The other servers will recieve the serialized lock and automattically deserialize it.
await eventBus.addListener("sending-lock-over-network", ({ lock }) => {
    // The lock is serialized and can be used
    console.log("LOCK:", lock);
});
```

### Lock events

You can listen to different lock events ([`LockEventMap`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.LockEventMap.html)) that are triggered by the [`Lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.Lock.html). Refer to the [`EventBus`](../2_Event%20bus/2_event_bus_usage.md) documentation to learn how to use events.

```ts
import { LOCK_EVENTS } from "@daiso-tech/core/lock/contracts";

// Will log whenever an lock is acquiured
await lockProvider.subscribe(LOCK_EVENTS.ACQUIRED, (event) => {
    console.log(event);
});

const lock = lockProvider.create("resource");
await lock.acquire();
console.log("");
await lock.release();
```

:::info
Note the [`Lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.Lock.html) class uses [`MemoryEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.MemoryEventBusAdapter.html) by default. You can choose what event bus adapter to use:

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
import { LockProvider } from "@daiso-tech/core/lock";
import { RedisPubSubEventBus } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Namespace } from "@daiso-tech/core/utilities";
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

const lock = new LockProvider({
    namespace: new Namespace("lock"),
    adapter: new MemoryLockAdapter(),
    eventBus: new EventBus({
        namespace: new Namespace("event-bus"),
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

:::info
Note you can disable dispatching [`Lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.Lock.html) events by passing an [`EventBus`](../2_Event%20bus/2_event_bus_usage.md) that uses [`NoOpEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.NoOpEventBusAdapter.html)
:::

:::warning
If multiple lock adapters (e.g., `RedisLockAdapter` and `MemoryLockAdapter`) are used at the same time, isolate their events by assigning separate namespaces. This prevents listeners from unintentionally capturing events across adapters.

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/cache/adapters";
import { Lock } from "@daiso-tech/core/cache";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Namespace } from "@daiso-tech/core/utilities";
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

const memoryLockAdapter = new MemoryLockAdapter();
const memoryLockProvider = new LockProvider({
    namespace: new Namespace("cache"),
    adapter: memoryLockAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemoryLockAdapter and RedisLockAdapter to isolate their events.
        namespace: new Namespace(["memory-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});

const redisLockAdapter = new RedisLockAdapter({
    serde,
    database: new Redis("YOUR_REDIS_CONNECTION_STRING"),
});
const redisLockProvider = new LockProvider({
    namespace: new Namespace("cache"),
    adapter: redisLockAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemoryLockAdapter and RedisLockAdapter to isolate their events.
        namespace: new Namespace(["redis-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

### Seperating creating locks, listening to locks and manipulating locks

The library includes 3 additional contracts:

-   [`ILock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILock.html) - Allows only manipulation of locks.

-   [`ILockProviderBase`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockProviderBase.html) - Allows only creation of locks.

-   [`ILockListenable`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockListenable.html) – Allows only to listening to lock events.

This seperation makes it easy to visually distinguish the 3 contracts, making it immediately obvious that they serve different purposes.

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
import {
    type ILock,
    type ILockProvider,
    type ILockListenable,
    LOCK_EVENTS,
} from "@daiso-tech/core/lock/contracts";

async function lockFunc(lock: ILock): Promise<void> {
    await lock.run(async () => {
        await doWork();
    });
}

async function lockProviderFunc(lockProvider: ILockProvider): Promise<void> {
    // You cannot access the listener methods
    // You will get typescript error if you try

    const lock = lockProvider.create("resource");
    await lockFunc(lock);
}

async function lockListenableFunc(
    lockListenable: ILockListenable,
): Promise<void> {
    // You cannot access the lockProvider methods
    // You will get typescript error if you try

    await lockListenable.addListener(LOCK_EVENTS.ACQUIRED, (event) => {
        console.log("ACQUIRED:", event);
    });
    await lockListenable.addListener(LOCK_EVENTS.RELEASED, (event) => {
        console.log("RELEASED:", event);
    });
}

await lockListenableFunc(lockProvider);
await lockProviderFunc(lockProvider);
```

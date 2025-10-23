# Lock

The `@daiso-tech/core/lock` component provides a way for managing locks independent of underlying platform or storage.

## Initial configuration

To begin using the `LockProvider` class, you'll need to create and configure an instance:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { MemoryLockAdapter } from "@daiso-tech/core/lock/memory-lock-adapter";
import { LockProvider } from "@daiso-tech/core/lock";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";

const serde = new Serde(new SuperJsonSerdeAdapter());

const lockProvider = new LockProvider({
    // You can provide default TTL value
    // If you set it to null it means locks will not expire and most be released manually by default.
    defaultTtl: TimeSpan.fromSeconds(2),

    serde,

    // You can choose the adapter to use
    adapter: new MemoryLockAdapter(),
});
```

:::info
Here is a complete list of settings for the [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.LockProviderSettingsBase.html) class.
:::

## Lock basics

### Creating a lock

```ts
const lock = lockProvider.create("shared-resource");
```

### Acquiring and releasing the lock

```ts
const hasAquired = await lock.acquire();
if (hasAquired) {
    try {
        // The critical section
    } finally {
        await lock.release();
    }
}
```

Alternatively you could write it as follows:

```ts
try {
    // This method will throw if the lock is not acquired
    await lock.acquireOrFail();
    // The critical section
} finally {
    await lock.release();
}
```

:::danger
You need always to wrap the critical section with `try-finally` so the lock get released when error occurs.
:::

:::danger
Note `Lock` class uses `Task` instead of a regular `Promise`. This means you must either await the `Task` or call its `detach` method to run it.
Refer to the [`@daiso-tech/core/task`](../Task.md) documentation for further information.
:::

### Locks with custom TTL

You can provide a custom TTL for the lock.

```ts
const lock = lockProvider.create("shared-resource", {
    // Default TTL is 5min if not overrided
    // If you set it to null it means locks will not expire and most be released manually.
    ttl: TimeSpan.fromSeconds(30),
});
```

### Checking lock state

You can get the lock state by using the `getState` method, it returns [`ILockState`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockState.html).

```ts
import { LOCK_STATE } from "@daiso-tech/core/lock/contracts";

const lock = lockProvider.create("shared-resource");
const state = await lock.getState();

if (state.type === LOCK_STATE.EXPIRED) {
    console.log("The lock doesnt exists");
}

if (state.type === LOCK_STATE.UNAVAILABLE) {
    console.log("Lock is acquired by different owner");
}

if (state.type === LOCK_STATE.ACQUIRED) {
    console.log("The lock is acquired");
}
```

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

const hasAcquired = await lock.acquire();
if (hasAcquired) {
    try {
        while (true) {
            await lock.refresh(TimeSpan.fromMinutes(1));
            const hasFinished = await doWork();
            if (hasFinished) {
                break;
            }
            await Task.delay(TimeSpan.fromSeconds(1));
        }
    } finally {
        await lock.release();
    }
}
```

:::warning
Note: A lock must have an expiration (a `ttl` value) to be refreshed. You cannot refresh a lock that was created without an expiration (with `ttl: null`)

```ts
// Create a lock with no expiration (non-refreshable)
const lock = lockProvider.create("resource", {
    ttl: null,
});

// A refresh attempt on this lock will fail
const hasRefreshed = await lock.refresh();

// This will log 'false' because the lock cannot be refreshed
console.log(hasRefreshed);
```

:::

### Additional methods

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

The `forceRelease` method releases the lock regardless of the owner:

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
Note the method returns a [`Result`](../../Utilities/Result%20type.md) type that can be inspected to determine the operation's success or failure.
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
Note the method returns a [`Result`](../../Utilities/Result%20type.md) type that can be inspected to determine the operation's success or failure.
:::

The `runBlockingOrFail` method automatically manages lock acquisition and release around function execution.
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
You can provide [`Task`](../Task.md), synchronous and asynchronous `Invokable` as values for `run`, `runOrFail`, `runBlocking` and `runBlockingOrFail` methods.
:::

### Lock instance variables

The `Lock` class exposes instance variables such as:

```ts
const lock = lockProvider.create("resource");

// Will return the key of the lock which is "resource"
console.log(lock.key);

// Will return the id of the lock
console.log(lock.id);

// Will return the ttl of the lock
console.log(lock.ttl);
```

### Lock id

By default the lock id is autogenerated but it can also manually defined.

```ts
const lock = lockProvider.create("lock", {
    lockId: "my-lock-id",
});

const hasAcquire = await lock.acquire();
if (hasAcquired) {
    console.log("Shared resource");
    await lock.release();
}
```

:::info
Manually defining lock id is primarily useful for debugging or implementing manual resource locking by the end user.

An example of manual resource locking by the end user can be found in a multi-user CMS, the end user manually locks a document during editing, this resource lock prevents simultaneous edits and data corruption.
:::

:::warning
In most cases, setting a custom lock id is unnecessary. Misusing this feature could result in different locks sharing the same lock id while modifying the same resource simultaneously, which may lead to race conditions.
:::

### Namespacing

You can use the `Namespace` class to group related locks without conflicts.

:::info
For further information about namespacing refer to [`@daiso-tech/core/namespace`](../Namespace.md) documentation.
:::

```ts
import { Namespace } from "@daiso-tech/core/namespace";
import { RedisLockAdapter } from "@daiso-tech/core/lock/redis-lock-adapter";
import { LockProvider } from "@daiso-tech/core/lock";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());

const lockProviderA = new LockProvider({
    namespace: new Namespace("@lock-a"),
    adapter: new RedisLockAdapter(database),
    serde,
});
const lockProviderB = new LockProvider({
    namespace: new Namespace("@lock-b"),
    adapter: new RedisLockAdapter(database),
    serde,
});

const lockA = await lockProviderA.create("key", { ttl: null });
const lockB = await lockProviderB.create("key", { ttl: null });

const hasAquiredA = await lockA.acquire();
// Will log true
console.log(hasAquiredA);

const hasAquiredB = await lockB.acquire();
// Will log true
console.log(hasAquiredB);

const hasReleasedB = await lockB.release();
// Will log true
console.log(hasReleasedB);

// Will log { type: "ACQUIRED", remainingTime: null }
console.log(await lockA.getState());

// Will log { type: "EXPIRED" }
console.log(await lockB.getState());
```

### Retrying acquiring lock

To retry acquiring lock you can use the [`retry`](../Resilience.md) middleware with [`Task.pipe`](../Task.md) method.

Retrying acquiring lock with `acquireOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireLockError } from "@daiso-tech/core/lock/contracts";

const lock = lockProvider.create("lock");

try {
    await lock.acquireOrFail().pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireLockError,
        }),
    );
    // The critical section
} finally {
    await lock.release();
}
```

Retrying acquiring lock with `acquire` method:

```ts
import { retry } from "@daiso-tech/core/resilience";

const lock = lockProvider.create("lock");

const hasAquired = await lock.acquire().pipe(
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
        await lock.release();
    }
}
```

Retrying acquiring lock with `runOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireLockError } from "@daiso-tech/core/lock/contracts";

const lock = lockProvider.create("lock");

await lock
    .runOrFail(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireLockError,
        }),
    );
```

Retrying acquiring lock with `run` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireLockError } from "@daiso-tech/core/lock/contracts";

const lock = lockProvider.create("lock");

await lock
    .run(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireLockError,
        }),
    );
```

### Serialization and deserialization of lock

Locks can be serialized, allowing them to be transmitted over the network to another server and later deserialized for reuse.
This means you can, for example, acquire the lock on the main server, transfer it to a queue worker server, and release it there.

Manually serializing and deserializing the lock:

```ts
import { RedisLockAdapter } from "@daiso-tech/core/lock/redis-lock-adapter";
import { LockProvider } from "@daiso-tech/core/lock";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisClient = new Redis("YOUR_REDIS_CONNECTION");

const lockProvider = new LockProvider({
    // You can laso pass in an array of Serde class instances
    serde,
    adapter: new RedisLockAdapter(redisClient),
});

const lock = lockProvider.create("resource");
const serializedLock = serde.serialize(lock);
const deserializedLock = serde.deserialize(lock);
```

:::danger
When serializing or deserializing a lock, you must use the same `Serde` instances that were provided to the `LockProvider`. This is required because the `LockProvider` injects custom serialization logic for `ILock` instance into `Serde` instances.
:::

:::info
Note you only need manuall serialization and deserialization when integrating with external libraries.
:::

As long you pass the same `Serde` instances with all other components you dont need to serialize and deserialize the lock manually.

```ts
import { RedisLockAdapter } from "@daiso-tech/core/lock/redis-lock-adapter";
import type { ILock } from "@daiso-tech/core/lock/contracts";
import { LockProvider } from "@daiso-tech/core/lock";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";

const serde = new Serde(new SuperJsonSerdeAdapter());
const mainRedisClient = new Redis("YOUR_REDIS_CONNECTION");
const listenerRedisClient = new Redis("YOUR_REDIS_CONNECTION");

type EventMap = {
    "sending-lock-over-network": {
        lock: ILock;
    };
};
const eventBus = new EventBus<EventMap>({
    adapter: new RedisPubSubEventBusAdapter({
        listenerClient,
        dispatcherClient: mainRedisClient,
        serde,
    }),
});

const lockProvider = new LockProvider({
    serde,
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

You can listen to different [lock events](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Lock.html) that are triggered by the `Lock`.
Refer to the [`EventBus`](../EventBus/index.md) documentation to learn how to use events.

```ts
import { LOCK_EVENTS } from "@daiso-tech/core/lock/contracts";

// Will log whenever an lock is acquiured
await lockProvider.subscribe(LOCK_EVENTS.ACQUIRED, (event) => {
    console.log(event);
});

const lock = lockProvider.create("resource");
await lock.acquire();
```

:::info
Note the `Lock` class uses [`MemoryEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.MemoryEventBusAdapter.html) by default. You can choose what event bus adapter to use:

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/lock/memory-lock-adapter";
import { LockProvider } from "@daiso-tech/core/lock";
import { RedisPubSubEventBus } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
import Redis from "ioredis";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisPubSubEventBusAdapter = new RedisPubSubEventBusAdapter({
    dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    serde,
});

const lock = new LockProvider({
    adapter: new MemoryLockAdapter(),
    eventBus: new EventBus({
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

:::info
Note you can disable dispatching `Lock` events by passing an `EventBus` that uses `NoOpEventBusAdapter`.
:::

:::warning
If multiple lock adapters (e.g., `RedisLockAdapter` and `MemoryLockAdapter`) are used at the same time, isolate their events by assigning separate namespaces. This prevents listeners from unintentionally capturing events across adapters.

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/lock/memory-lock-adapter";
import { EventBus } from "@daiso-tech/core/event-bus";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
import Redis from "ioredis";
import { Namespace } from "@daiso-tech/core/namespace";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisPubSubEventBusAdapter = new RedisPubSubEventBusAdapter({
    dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
    serde,
});

const memoryLockAdapter = new MemoryLockAdapter();
const memoryLockProvider = new LockProvider({
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
    adapter: redisLockAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemoryLockAdapter and RedisLockAdapter to isolate their events.
        namespace: new Namespace(["redis-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

### Seperating creating, listening to and manipulating locks

The library includes 3 additional contracts:

- `ILock` - Allows only manipulation of the lock.

- `ILockProviderBase` - Allows only creation of locks.

- `ILockListenable` – Allows only to listening to lock events.

This seperation makes it easy to visually distinguish the 3 contracts, making it immediately obvious that they serve different purposes.

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/lock/memory-lock-adapter";
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

## Further information

For further information refer to [`@daiso-tech/core/lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Lock.html) API docs.

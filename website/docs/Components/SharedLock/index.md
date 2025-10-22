# SharedLock

The `@daiso-tech/core/shared-lock` component provides a way for managing shared-locks (a.k.a reader writer locks) independent of underlying platform or storage.

## Initial configuration

To begin using the `SharedLockProvider` class, you'll need to create and configure an instance:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());

const sharedLockProvider = new SharedLockProvider({
    // You can provide default TTL value
    // If you set it to null it means shared-locks will not expire and most be released manually by default.
    defaultTtl: TimeSpan.fromSeconds(2),

    serde,

    // You can choose the adapter to use
    adapter: new MemorySharedLockAdapter(),
});
```

:::info
Here is a complete list of settings for the [`SharedLockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/SharedLock.SharedLockProviderSettingsBase.html) class.
:::

## Shared lock basics

### Creating a shared-lock
```ts
const sharedLock = sharedLockProvider.create("shared-resource", {
    // You need to define a limit
    limit: 2
});
```

### Acquiring and releasing the shared-lock as reader

```ts
// 1 slot will be acquired
if (await sharedLock.acquireReader()) {
    console.log("Acquired");
    try {
        // The concurrent section
    } finally {
        await sharedLock.releaseReader();
    }
}
else {
    console.log("Unable to acquire");
}

// 2 slots will be acquired
if (await sharedLock.acquireReader()) {
    console.log("Acquired");
    try {
        // The concurrent section
    } finally {
        await sharedLock.releaseReader();
    }
}
else {
    console.log("Unable to acquire");
}

// Will log false because the limit is reached
console.log(await sharedLock.acquireReader());
```

Alternatively you could write it as follows:

```ts

// 1 slot will be acquired
try {
    console.log("Acquired");
    // This method will throw if the shared-lock limit is reached.
    await sharedLock.acquireReaderOrFail();
    // The critical section
}
catch {
    console.log("Unable to acquire");
}
finally {
    await sharedLock.releaseReader();
}

// 2 slots will be acquired
try {
    console.log("Acquired");
    // This method will throw if the shared-lock limit is reached.
    await sharedLock.acquireReaderOrFail();
    // The critical section
}
catch {
    console.log("Unable to acquire");
}
finally {
    await sharedLock.releaseReader();
}

// Will throw because the limit is reached
await sharedLock.acquireReaderOrFail();
```

:::danger
You need always to wrap the concurrent section with `try-finally` so the shared-lock get released when error occurs.
:::

:::danger
Note `SharedLock` class uses `Task` instead of a regular `Promise`. This means you must either await the `Task` or call its `detach` method to run it.
Refer to the [`@daiso-tech/core/task`](../Task.md) documentation for further information.
:::

### Acquiring and releasing the shared-lock as writer

```ts
const hasAquired = await sharedLock.acquireWriter();
if (hasAquired) {
    try {
        // The critical section
    } finally {
        await sharedLock.releaseWriter();
    }
}
```

Alternatively you could write it as follows:

```ts
try {
    // This method will throw if the shared-lock is not acquired
    await sharedLock.acquireWriterOrFail();
    // The critical section
} finally {
    await sharedLock.releaseWriter();
}
```

:::danger
You need always to wrap the critical section with `try-finally` so the shared-lock get released when error occurs.
:::

### Shared lock with custom TTL

You can provide a custom TTL for the shared-lock.

```ts
const sharedLock = sharedLockProvider.create("shared-resource", {
    // Default TTL is 5min if not overrided
    // If you set it to null it means shared-lock will not expire and most be released manually.
    ttl: TimeSpan.fromSeconds(30),
    limit: 2,
});
```

### Checking shared-lock state

You can get the shared-lock state by using the `getState` method, it returns [`ISharedLockState`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/SharedLock.ISharedLockState.html).

```ts
import { SHARED_LOCK_STATE } from "@daiso-tech/core/shared-lock/contracts";

const sharedLock = sharedLockProvider.create("shared-resource", {
    limit: 2,
});
const state = await sharedLock.getState();

if (state.type === SHARED_LOCK_STATE.EXPIRED) {
    console.log("The shared-lock doesnt exists");
}

if (state.type === SHARED_LOCK_STATE.READER_LIMIT_REACHED) {
    console.log("The shared-lock is in reader mode and limit have been reached and all slots are unavailable");
}

if (state.type === SHARED_LOCK_STATE.READER_ACQUIRED) {
    console.log("The shared-lock is in reader mode and is acquired");
}

if (state.type === SHARED_LOCK_STATE.READER_UNACQUIRED) {
    console.log("The shared-lock is in reader mode and there are avilable slots but the shared-lock is not acquired");
}

if (state.type === SHARED_LOCK_STATE.WRITER_UNAVAILABLE) {
    console.log("The shared-lock is in writer mode and is acquired by different owner");
}

if (state.type === SHARED_LOCK_STATE.WRITER_ACQUIRED) {
    console.log("The shared-lock is in writer mode and is acquired");
}
```

## Patterns

### Acquire blocking

You can acquire a shared-lock at regular intervals until either successful or a specified timeout is reached:

#### As reader

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

const hasAcquired = await sharedLock.acquireReaderBlocking({
    // Time to wait 1 minute
    time: TimeSpan.fromMinutes(1),
    // Intervall to try acquire a sharedLock
    interval: TimeSpan.fromSeconds(1),
});
if (hasAcquired) {
    try {
        await doWork();
    } finally {
        await sharedLock.releaseReader();
    }
}
// Will be logged after 1min
console.log("END");
```

#### As writer

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

const hasAcquired = await sharedLock.acquireWriterBlocking({
    // Time to wait 1 minute
    time: TimeSpan.fromMinutes(1),
    // Intervall to try acquire a sharedLock
    interval: TimeSpan.fromSeconds(1),
});
if (hasAcquired) {
    try {
        await doWork();
    } finally {
        await sharedLock.releaseWriter();
    }
}
// Will be logged after 1min
console.log("END");
```

:::warning
Note using `acquireReaderBlocking` and `acquireWriterBlocking` in a HTTP request handler is discouraged because it blocks the HTTP request handler causing the handler wait until the shared becomes available or the timeout is reached. This will delay HTTP request handler to generate response and will make frontend app slow because of HTTP request handler.
:::


### Refreshing shared-locks

The shared-lock can be refreshed by the current owner before it expires. This is particularly useful for long-running tasks,
instead of setting an excessively long TTL initially, you can start with a shorter one and use the `refreshWriter` or `refreshReader` method to set the TTL of the shared-lock:

#### As reader

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2,
    ttl: TimeSpan.fromMinutes(1),
});

const hasAcquired = await sharedLock.acquireWriter();
if (hasAcquired) {
    try {
        while (true) {
            await sharedLock.refreshWriter(TimeSpan.fromMinutes(1));
            const hasFinished = await doWork();
            if (hasFinished) {
                break;
            }
            await Task.delay(TimeSpan.fromSeconds(1));
        }
    } finally {
        await sharedLock.releaseWriter();
    }
}
```

#### As writer

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2,
    ttl: TimeSpan.fromMinutes(1),
});

const hasAcquired = await sharedLock.acquireWriter();
if (hasAcquired) {
    try {
        while (true) {
            await sharedLock.refreshReader(TimeSpan.fromMinutes(1));
            const hasFinished = await doWork();
            if (hasFinished) {
                break;
            }
            await Task.delay(TimeSpan.fromSeconds(1));
        }
    } finally {
        await sharedLock.releaseReader();
    }
}
```

:::warning
Note: A shared-lock must have an expiration (a `ttl` value) to be refreshed. You cannot refresh a shared-lock that was created without an expiration (with `ttl: null`)

```ts
// Create a shared-lock with no expiration (non-refreshable)
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2,
    ttl: null,
});

// A writer refresh attempt on this shared-ock will fail
const hasRefreshedWriter = await sharedLock.refreshWriter();

// This will log 'false' because the sharedLock cannot be refreshed
console.log(hasRefreshedWriter);

// A reader refresh attempt on this shared-ock will fail
const hasRefreshedReader = await sharedLock.refreshReader();

// This will log 'false' because the sharedLock cannot be refreshed
console.log(hasRefreshedReader);
```
:::

### Additional writer methods

The `acquireWriterBlockingOrFail` method is the same as `acquireWriterBlocking` method but it throws an error when not enable to acquire the shared-lock as writer:

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.acquireWriterBlockingOrFail({
    // You can provide the same configuration as in acquireBlocking method
});
```

The `releaseWriterOrFail` method is the same `releaseWriter` method but it throws an error when not enable to release the shared-lock as writer:

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.releaseWriterOrFail();
```

The `forceReleaseWriter` method releases the shared-lock regardless of the owner if in writer mode:

```ts
const sharedLock = sharedLockProvider.create("resource");

await sharedLock.forceReleaseWriter();
```

The `refreshWriterOrFail` method is the same `refreshWriter` method but it throws an error when not enable to refresh the shared-lock as writer:

```ts
const sharedLock = sharedLockProvider.create("resource");

await sharedLock.refreshWriterOrFail();
```

The `runWriter` method automatically manages shared-lock acquisition and release as writer around function execution.
It calls `acquireWriter` before invoking the function and calls `releaseWriter` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runWriter(async () => {
    await doWork();
});
```

:::info
Note the method returns a [`Result`](../../Utilities/Result%20type.md) type that can be inspected to determine the operation's success or failure.
:::

The `runWriterOrFail` method automatically manages shared-lock acquisition and release as writer around function execution.
It calls `acquireWriterOrFail` before invoking the function and calls `releaseWriter` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runWriterOrFail(async () => {
    await doWork();
});
```

:::info
Note the method throws an error when the shared-lock cannot be acquired as writer.
:::

The `runWriterBlocking` method automatically manages shared-lock acquisition and release as writer around function execution.
It calls `acquireWriterBlocking` before invoking the function and calls `releaseWriter` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runWriterBlocking(
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

The `runWriterBlockingOrFail` method automatically manages shared-lock acquisition and release as writer around function execution.
It calls `acquireWriterBlockingOrFail` before invoking the function and calls `releaseWriter` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runWriterBlockingOrFail(
    async () => {
        await doWork();
    },
    {
        // You can provide the same configuration as in acquireBlocking method
    },
);
```

:::info
Note the method throws an error when a shared-lock cannot be acquired as writer.
:::

:::info
You can provide [`Task`](../Task.md), synchronous and asynchronous `Invokable` as values for `runWriter`, `runWriterOrFail`, `runWriterBlocking`, and `runWriterBlockingOrFail` methods.
:::

### Additional reader methods

The `acquireReaderBlockingOrFail` method is the same as `acquireReaderBlocking` method but it throws an error when not enable to acquire the shared-lock as writer:

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.acquireReaderBlockingOrFail({
    // You can provide the same configuration as in acquireBlocking method
});
```

The `releaseReaderOrFail` method is the same `releaseReader` method but it throws an error when not enable to release the shared-lock as reader:

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.releaseReaderOrFail();
```

The `forceReleaseAllReaders` method releases all the slots of the shared-lock if in reader mode:

```ts
const sharedLock = sharedLockProvider.create("resource");

await sharedLock.forceReleaseAllReaders();
```

The `refreshReaderOrFail` method is the same `refreshReader` method but it throws an error when not enable to refresh the shared-lock as reader:

```ts
const sharedLock = sharedLockProvider.create("resource");

await sharedLock.refreshReaderOrFail();
```

The `runReader` method automatically manages shared-lock acquisition and release as reader around function execution.
It calls `acquireReader` before invoking the function and calls `releaseReader` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runReader(async () => {
    await doWork();
});
```

:::info
Note the method returns a [`Result`](../../Utilities/Result%20type.md) type that can be inspected to determine the operation's success or failure.
:::

The `runReaderOrFail` method automatically manages shared-lock acquisition and release as reader around function execution.
It calls `acquireReaderOrFail` before invoking the function and calls `releaseReader` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runReaderOrFail(async () => {
    await doWork();
});
```

:::info
Note the method throws an error when the shared-lock cannot be acquired as reader.
:::

The `runReaderBlocking` method automatically manages shared-lock acquisition and release as reader around function execution.
It calls `acquireReaderBlocking` before invoking the function and calls `releaseReader` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runReaderBlocking(
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

The `runReaderBlockingOrFail` method automatically manages shared-lock acquisition and release as reader around function execution.
It calls `acquireReaderBlockingOrFail` before invoking the function and calls `releaseReader` in a finally block, ensuring the shared-lock is always freed, even if an error occurs during execution.

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

await sharedLock.runReaderBlockingOrFail(
    async () => {
        await doWork();
    },
    {
        // You can provide the same configuration as in acquireBlocking method
    },
);
```

:::info
Note the method throws an error when a shared-lock cannot be acquired as reader.
:::

:::info
You can provide [`Task`](../Task.md), synchronous and asynchronous `Invokable` as values for `runReader`, `runReaderOrFail`, `runReaderBlocking`, and `runReaderBlockingOrFail` methods.
:::

### Additional methods

The `forceRelease` method releases the shared-lock regardless it its in reader or writer mode:

```ts
const sharedLock = sharedLockProvider.create("resource");

await sharedLock.forceRelease();
```

### SharedLock instance variables

The `SharedLock` class exposes instance variables such as:

```ts
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

// Will return the key of the shared-lock which is "resource"
console.log(sharedLock.key);

// Will return the id of the shared-lock
console.log(sharedLock.id);

// Will return the ttl of the shared-lock
console.log(sharedLock.ttl);
```


### SharedLock id

By default the shared-lock id is autogenerated but it can also manually defined.

```ts
const sharedLock = sharedLockProvider.create("shared-lock", {
    lockId: "my-shared-lock-id",
});

const hasAcquire = await sharedLock.acquireWriter();
if (hasAcquired) {
    console.log("Shared resource");
    await sharedLock.releaseWriter();
}
```

:::info
Manually defining shared-lock id is primarily useful for debugging or implementing manual resource controll by the end user.
:::

:::warning
In most cases, setting a shared-lock id is unnecessary.
:::

### Namespacing

You can use the `Namespace` class to group related shared-locks without conflicts.

:::info
For further information about namespacing refer to [`@daiso-tech/core/namespace`](../Namespace.md) documentation.
:::

```ts
import { Namespace } from "@daiso-tech/core/namespace";
import { RedisSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());

const sharedLockProviderA = new SharedLockProvider({
    namespace: new Namespace("@sharedLock-a"),
    adapter: new RedisSharedLockAdapter(database),
    serde,
});
const sharedLockProviderB = new SharedLockProvider({
    namespace: new Namespace("@sharedLock-b"),
    adapter: new RedisSharedLockAdapter(database),
    serde,
});

const sharedLockA = await sharedLockProviderA.create("key", {
    ttl: null,
    limit: 1
});
const sharedLockB = await sharedLockProviderB.create("key", {
    ttl: null,
    limit: 1
});

const hasAquiredA = await sharedLockA.acquireWriter();
// Will log true
console.log(hasAquiredA);

const hasAquiredB = await sharedLockB.acquireWriter();
// Will log true
console.log(hasAquiredB);

const hasReleasedB = await sharedLockB.releaseWriter();
// Will log true
console.log(hasReleasedB);

// Will log { type: "WRITER_ACQUIRED", remainingTime: null }
console.log(await sharedLockA.getState());

// Will log { type: "EXPIRED" }
console.log(await sharedLockB.getState());
```

### Retrying acquiring shared-lock as writer

To retry acquiring shared-lock you can use the [`retry`](../Resilience.md) middleware with [`Task.pipe`](../Task.md) method.

Retrying acquiring shared-lock with `acquireWriterOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireWriterLockError } from "@daiso-tech/core/shared-lock/contracts";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

try {
    await sharedLock.acquireWriterOrFail().pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireWriterLockError,
        }),
    );
    // The critical section
} finally {
    await sharedLock.release();
}
```

Retrying acquiring sharedLock with `acquireWriter` method:

```ts
import { retry } from "@daiso-tech/core/resilience";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

const hasAquired = await sharedLock.acquireWriter().pipe(
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
        await sharedLock.release();
    }
}
```

Retrying acquiring shared-lock with `runWriterOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireWriterLockError } from "@daiso-tech/core/shared-lock/contracts";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

await sharedLock
    .runWriterOrFail(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireWriterLockError,
        }),
    );
```

Retrying acquiring shared-lock with `runWriter` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { FailedAcquireWriterLockError } from "@daiso-tech/core/shared-lock/contracts";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

await sharedLock
    .runWriter(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: FailedAcquireWriterLockError,
        }),
    );
```


### Retrying acquiring shared-lock as reader

Retrying acquiring shared-lock with `acquireReaderOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { LimitReachedReaderSemaphoreError } from "@daiso-tech/core/shared-lock/contracts";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

try {
    await sharedLock.acquireReaderOrFail().pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: LimitReachedReaderSemaphoreError,
        }),
    );
    // The critical section
} finally {
    await sharedLock.release();
}
```

Retrying acquiring sharedLock with `acquireReader` method:

```ts
import { retry } from "@daiso-tech/core/resilience";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

const hasAquired = await sharedLock.acquireReader().pipe(
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
        await sharedLock.release();
    }
}
```

Retrying acquiring shared-lock with `runReaderOrFail` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { LimitReachedReaderSemaphoreError } from "@daiso-tech/core/shared-lock/contracts";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

await sharedLock
    .runReaderOrFail(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: LimitReachedReaderSemaphoreError,
        }),
    );
```

Retrying acquiring shared-lock with `runReader` method:

```ts
import { retry } from "@daiso-tech/core/resilience";
import { LimitReachedReaderSemaphoreError } from "@daiso-tech/core/shared-lock/contracts";

const sharedLock = sharedLockProvider.create("shared-lock", {
    limit: 2
});

await sharedLock
    .runReader(async () => {
        // The critical section
    })
    .pipe(
        retry({
            maxAttempts: 4,
            errorPolicy: LimitReachedReaderSemaphoreError,
        }),
    );
```

### Serialization and deserialization of shared-lock

Shared-locks can be serialized, allowing them to be transmitted over the network to another server and later deserialized for reuse.
This means you can, for example, acquire the shared-lock on the main server, transfer it to a queue worker server, and release it there.

Manually serializing and deserializing the shared-lock:

```ts
import { RedisSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());

const redisClient = new Redis("YOUR_REDIS_CONNECTION");

const sharedLockProvider = new SharedLockProvider({
    // You can laso pass in an array of Serde class instances
    serde,
    adapter: new RedisSharedLockAdapter(redisClient),
});

const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});
const serializedSharedLock = serde.serialize(sharedLock);
const deserializedSharedLock = serde.deserialize(sharedLock);
```

:::danger
When serializing or deserializing a shared-lock, you must use the same `Serde` instances that were provided to the `SharedLockProvider`. This is required because the `SharedLockProvider` injects custom serialization logic for `ISharedLock` instance into `Serde` instances.
:::

:::info
Note you only need manuall serialization and deserialization when integrating with external libraries.
:::

As long you pass the same `Serde` instances with all other components you dont need to serialize and deserialize the shared-lock manually.

```ts
import { RedisSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import type { ISharedLock } from "@daiso-tech/core/shared-lock/contracts";
import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());
const mainRedisClient = new Redis("YOUR_REDIS_CONNECTION");
const listenerRedisClient = new Redis("YOUR_REDIS_CONNECTION");

type EventMap = {
    "sending-shared-lock-over-network": {
        sharedLock: ISharedLock;
    };
};
const eventBus = new EventBus<EventMap>({
    adapter: new RedisPubSubEventBusAdapter({
        listenerClient,
        dispatcherClient: mainRedisClient,
        serde,
    }),
});

const sharedLockProvider = new SharedLockProvider({
    serde,
    adapter: new RedisSharedLockAdapter(mainRedisClient),
    eventBus,
});
const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});

// We are sending the shared-lock over the network to other servers.
await eventBus.dispatch("sending-shared-lock-over-network", {
    sharedLock,
});

// The other servers will recieve the serialized shared-lock and automattically deserialize it.
await eventBus.addListener("sending-shared-lock-over-network", ({ sharedLock }) => {
    // The shared-lock is serialized and can be used
    console.log("SHARED_LOCK:", sharedLock);
});
```

### SharedLock events

You can listen to different [shared-lock events](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/SharedLock.html) that are triggered by the `SharedLock`.
Refer to the [`EventBus`](../EventBus/index.md) documentation to learn how to use events.

```ts
import { SHARED_LOCK_EVENTS } from "@daiso-tech/core/shared-lock/contracts";

// Will log whenever an shared-lock is acquiured
await sharedLockProvider.subscribe(SHARED_LOCK_EVENTS.WRITER_ACQUIRED, (event) => {
    console.log(event);
});

const sharedLock = sharedLockProvider.create("resource", {
    limit: 2
});
await sharedLock.acquireWriter();
```

:::info
Note the `SharedLock` class uses [`MemoryEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.MemoryEventBusAdapter.html) by default. You can choose what event bus adapter to use:

```ts
import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { SharedLockProvider } from "@daiso-tech/core/shared-lock";
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

const sharedLock = new SharedLockProvider({
    adapter: new MemorySharedLockAdapter(),
    eventBus: new EventBus({
        adapter: redisPubSubEventBusAdapter,
    }),
});
```
:::

:::info
Note you can disable dispatching `SharedLock` events by passing an `EventBus` that uses `NoOpEventBusAdapter`.
:::

:::warning
If multiple shared-lock adapters (e.g., `RedisSharedLockAdapter` and `MemorySharedLockAdapter`) are used at the same time, isolate their events by assigning separate namespaces. This prevents listeners from unintentionally capturing events across adapters.

```ts
import { MemorySharedLockAdapter } from "@daiso-tech/core/cache/adapters";
import { SharedLock } from "@daiso-tech/core/cache";
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

const memorySharedLockAdapter = new MemorySharedLockAdapter();
const memorySharedLockProvider = new SharedLockProvider({
    adapter: memorySharedLockAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemorySharedLockAdapter and RedisSharedLockAdapter to isolate their events.
        namespace: new Namespace(["memory-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});

const redisSharedLockAdapter = new RedisSharedLockAdapter({
    serde,
    database: new Redis("YOUR_REDIS_CONNECTION_STRING"),
});
const redisSharedLockProvider = new SharedLockProvider({
    adapter: redisSharedLockAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemorySharedLockAdapter and RedisSharedLockAdapter to isolate their events.
        namespace: new Namespace(["redis-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});
```
:::

### Seperating creating, listening to and manipulating shared-lock

The library includes 3 additional contracts:

- `ISharedLock` - Allows only manipulation of the shared-lock.

- `IWriterLock` - Allows only manipulation of the shared-lock as writer.

- `IReaderSemaphore` - Allows only manipulation of the shared-lock as reader.

- `ISharedLockProviderBase` - Allows only creation of shared-locks.

- `ISharedLockListenable` – Allows only to listening to shared-lock events.

This seperation makes it easy to visually distinguish the 3 contracts, making it immediately obvious that they serve different purposes.

```ts
import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import {
    type ISharedLock,
    type ISharedLockProvider,
    type ISharedLockListenable,
    type IWriterLock,
    type IReaderSemaphore,
    SHARED_LOCK_EVENTS,
} from "@daiso-tech/core/shared-lock/contracts";

async function writerLockFunc(writerLock: IWriterLock): Promise<void> {
    // You cannot access the writer methods
    // You will get typescript error if you try

    await writerLock.runWriter(async () => {
        await doWork();
    });
}

async function readerSemaphoreFunc(readerSemaphore: IReaderSemaphore): Promise<void> {
    // You cannot access the reader methods
    // You will get typescript error if you try

    await readerSemaphore.runReader(async () => {
        await doWork();
    });
}

async function sharedLockFunc(sharedLock: ISharedLock): Promise<void> {
    await writerLockFunc(sharedLock);
    await readerSemaphoreFunc(sharedLock);

    // You can access this method because it is not part of the writer or reader methods.
    await sharedLock.forceRelease();
}

async function sharedLockProviderFunc(sharedLockProvider: ISharedLockProvider): Promise<void> {
    // You cannot access the listener methods
    // You will get typescript error if you try

    const sharedLock = sharedLockProvider.create("resource", {
        limit: 2
    });
    await sharedLockFunc(sharedLock);
}

async function sharedLockListenableFunc(
    sharedLockListenable: ISharedLockListenable,
): Promise<void> {
    // You cannot access the sharedLockProvider methods
    // You will get typescript error if you try

    await sharedLockListenable.addListener(SHARED_LOCK_EVENTS.WRITER_ACQUIRED, (event) => {
        console.log("WRITER ACQUIRED:", event);
    });
    await sharedLockListenable.addListener(SHARED_LOCK_EVENTS.WRITER_RELEASED, (event) => {
        console.log("WRITER RELEASED:", event);
    });

    await sharedLockListenable.addListener(SHARED_LOCK_EVENTS.READER_ACQUIRED, (event) => {
        console.log("READER ACQUIRED:", event);
    });
    await sharedLockListenable.addListener(SHARED_LOCK_EVENTS.READER_RELEASED, (event) => {
        console.log("READER RELEASED:", event);
    });
}

await sharedLockListenableFunc(sharedLockProvider);
await sharedLockProviderFunc(sharedLockProvider);
```

## Further information

For further information refer to [`@daiso-tech/core/shared-lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/SharedLock.html) API docs.

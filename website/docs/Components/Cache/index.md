# Cache

The `@daiso-tech/core/cache` component provides a way for storing key-value pairs with expiration independent of data storage

## Initial configuration

To begin using the `Cache` class, you'll need to create and configure an instance:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";

const cache = new Cache({
    // You can provide default TTL value
    // If you set it to null it means keys will be stored forever.
    defaultTtl: TimeSpan.fromSeconds(2),

    // You can choose the adapter to use
    adapter: new MemoryCacheAdapter(),
});
```

:::info
Here is a complete list of settings for the `Cache` class.
:::

## Cache basics

### Adding keys

You can add a key and provide a optional TTL to overide the default:

```ts
await cache.add("a", "value", TimeSpan.fromSeconds("1"));
```

:::danger
Note `Cache` class instance uses `Task` instead of a regular `Promise`. This means you must either await the `Task` or call its `detach` method to run it.
Refer to the [`@daiso-tech/core/task`](../Task.md) documentation for further information.
:::

### Retrieving keys

You can retrieve the key:

```ts
await cache.get("a");
```

### Checking key existence

You can check if the key exists:

```ts
await cache.exists("a");
```

You can check if the key is missing:

```ts
await cache.missing("a");
```

### Updating keys

You can update a key value and true will be returned if the key exists and was updated:

```ts
await cache.update("a", 2);
```

You can increment the a key and true will be returned if the key exists and was updated. If the key is not a number an error will be thrown:

```ts
await cache.increment("a", 2);
```

You can decrement the a key and true will be returned if the key exists and was updated. If the key is not a number an error will be thrown,:

```ts
await cache.decrement("a", 1);
```

You can replace the key value with a given TTL if the key exists otherwise the key will be added:

```ts
await cache.put("a", 2);
await cache.put("a", 2, TimeSpan.fromSeconds(3));
```

### Removing keys

You can remove a key and true will be returned if the key was found and removed:

```ts
await cache.remove("a");
```

You can remove multiple keys and true will be returned if one of the keys exists and where removed:

```ts
await cache.removeMany(["a", "b"]);
```

You can clear all the keys of the given namespace:

```ts
await cache.clear();
```

## Patterns

### Compile time type safety

You can enforce compile time type safety by setting the cache value type:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";

type IUser = {
    name: string;
    email: string;
    age: number;
};

const cache = new Cache<IUser>({
    adapter: new MemoryCacheAdapter(),
});

// A typescript error will occur because the type is not mathcing.
await cache.add("a", "asd");
```

If you have multiple types you can use algeberical enums:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";

type IUser = {
    type: "USER";
    name: string;
    email: string;
    age: number;
};
type IProduct = {
    type: "PRODUCT";
    name: string;
    price: number;
};
type CacheValue = IUser | IProduct;

const cache = new Cache<CacheValue>({
    adapter: new MemoryCacheAdapter(),
});

const cacheValue = await cache.get("user1");
// You need to check the type is "USER" inorder to access IUser fields.
if (cacheValue.type === "USER") {
    console.log(cacheValue.name, cacheValue.age);
}
// You need to check the type is "PRODUCT" inorder to access IProduct fields.
if (cacheValue.type === "PRODUCT") {
    console.log(cacheValue.name, cacheValue.price);
}
```

Alternatively you can use different `Cache` classes with different namespaces:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";

const cacheAdapter = new MemoryCacheAdapter();

type IUser = {
    name: string;
    email: string;
    age: number;
};
const userCache = new Cache<IUser>({
    adapter: cacheAdapter,
});

type IProduct = {
    name: string;
    price: number;
};
const productCache = new Cache<IProduct>({
    adapter: cacheAdapter,
});
```

### Runtime type safety

You can enforce runtime and compiletime type safety by passing [standard schema](https://standardschema.dev/) to the cache:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";
import { z } from "zod";

const userSchema = z.object({
    name: z.string();
    email: z.string();
    age: z.number();
});

// The type will be infered
const cache = new Cache({
    adapter: new MemoryCacheAdapter(),
    schema: userSchema
});

// A typescript and runtime error will occur because the type is not mathcing.
await cache.add("a", "asd")
```

### Additional methods

You can retrieve the key and if it does not exist an error will be thrown:

```ts
await cache.getOrFail("ab");
```

You can retrieve the key and if it does not exist you can return a default value:

```ts
await cache.getOr("ab", 1);
```

You can retrieve the key and if it does not exist you can insert a default value that will aslo be returned:

```ts
await cache.getOrAdd("ab", 1);
```

:::info
You can provide `Task`, synchronous and asynchronous `Invokable` as default values for both `getOr` and `getOrAdd` methods.
:::

You can retrieve the key and afterwards remove it and will return true if the value was found:

```ts
await cache.getAndRemove("ab");
```

### Namespacing

You can use the `Namespace` class to group related data without conflicts.

:::info
For further information about namespacing refer to [`@daiso-tech/core/namespace`](../Namespace.md) documentation.
:::

```ts
import { Namespace } from "@daiso-tech/core/namespace";
import { RedisCacheAdapter } from "@daiso-tech/core/cache/redis-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());

const cacheA = new Cache({
    namespace: new Namespace("@cache-a"),
    adapter: new RedisCacheAdapter({
        database,
        serde,
    }),
});
const cacheB = new Cache({
    namespace: new Namespace("@cache-b"),
    adapter: new RedisCacheAdapter({
        database,
        serde,
    }),
});

await cacheA.add("key", 1);

// cacheA Logs 1
console.log(await cacheA.get("key"));

// cacheB Logs null
console.log(await cacheB.get("key"));

await cacheB.add("key", "tests");

// cacheB Logs "test"
console.log(await cacheB.get("key"));

// cacheA still Logs 1
console.log(await cacheA.get("key"));
```

### Cache events

You can listen to different [cache events](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Cache.html) that are triggered by the `Cache` class.
Refer to the [`@daiso-tech/core/event-bus`](../EventBus/index.md) documentation to learn how to use events.

```ts
import { CACHE_EVENTS } from "@daiso-tech/core/cache/contracts";

// Will log whenever an item is added, updated and removed
await cache.subscribe(CACHE_EVENTS.WRITTEN, (event) => {
    console.log(event);
});

await cache.add("a", "b");
await cache.update("a", 1);
await cache.increment("a", 1);
await cache.remove("a");
```

:::info
Note the `Cache` class uses `MemoryEventBusAdapter` by default. You can choose what event bus adapter to use:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";
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

const cache = new Cache({
    adapter: new MemoryCacheAdapter(),
    eventBus: new EventBus({
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

:::info
Note you can disable dispatching `Cache` events by passing an `EventBus` that uses `NoOpEventBusAdapter`.
:::

:::warning
If multiple cache adapters (e.g., `RedisCacheAdapter` and `MemoryCacheAdapter`) are used at the same time, isolate their events by assigning separate namespaces. This prevents listeners from unintentionally capturing events across adapters.

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";
import { Cache } from "@daiso-tech/core/cache";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Namespace } from "@daiso-tech/core/namespace";
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

const memoryCacheAdapter = new MemoryCacheAdapter();
const memoryCache = new Cache({
    adapter: memoryCacheAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemoryCacheAdapter and RedisCacheAdapter to isolate their events.
        namespace: new Namespace(["memory-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});

const redisCacheAdapter = new RedisCacheAdapter({
    serde,
    database: new Redis("YOUR_REDIS_CONNECTION_STRING"),
});
const redisCache = new Cache({
    adapter: redisCacheAdapter,
    eventBus: new EventBus({
        // We assign distinct namespaces to MemoryCacheAdapter and RedisCacheAdapter to isolate their events.
        namespace: new Namespace(["redis-cache", "event-bus"]),
        adapter: redisPubSubEventBusAdapter,
    }),
});
```

:::

### Seperating manipulating cache and listening

The library includes two additional contracts:

- `ICacheBase` - Allows only manipulate the cache.

- `ICacheListenable` – Allows only listening to cache events.

This seperation makes it easy to visually distinguish the two contracts, making it immediately obvious that they serve different purposes.

```ts
import type {
    ICache,
    ICahceBase,
    ICacheListenable,
    CACHE_EVENTS,
} from "@daiso-tech/core/cache/contracts";

function manipulatingFunc(cache: ICahceBase): Promise<void> {
    // You cannot access the listener methods
    // You will get typescript error if you try

    await cache.add("a", 1);
}
function listenerFunc(cacheListenable: ICacheListenable): Promise<void> {
    // You cannot access the cache methods
    // You will get typescript error if you try

    await cacheListenable.addListener(CACHE_EVENTS.WRITTEN, (event) => {
        console.log("EVENT:", event);
    });
}

await listenerFunc(cache);
await manipulatingFunc(cache);
```

## Further information

For further information refer to [`@daiso-tech/core/cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Cache.html) API docs.

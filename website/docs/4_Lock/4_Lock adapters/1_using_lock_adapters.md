---
sidebar_position: 1
---

# Using lock adapters

## MemoryLockAdapter

To use the [`MemoryLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.MemoryLockAdapter.html) you only need to create instance of it:

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";

const memoryLockAdapter = new MemoryLockAdapter();
```

You can also provide an `Map` that will be used for storing the data in memory:

```ts
import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";

const map = new Map<any, any>();
const memoryLockAdapter = new MemoryLockAdapter(map);
```

:::info
[`MemoryLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.MemoryLockAdapter.html) lets you test your app without external dependencies like `Redis`, ideal for local development, unit tests, integration tests and fast E2E test for the backend application.
:::

:::danger
Note the [`MemoryLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.MemoryLockAdapter.html) is limited to single process usage and cannot be shared across multiple servers or processes.
:::

## MongodbLockAdapter

To use the [`MongodbLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.MongodbLockAdapter.html), you'll need to:

1. Install the required dependency: [`mongodb`](https://www.npmjs.com/package/mongodb) package

```ts
import { MongodbLockAdapter } from "@daiso-tech/core/lock/adapters";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");
const mongodbLockAdapter = new MongodbLockAdapter({
    database,
});

// You need initialize the adapter once before using it.
// During the initialization the indexes will be created
await mongodbLockAdapter.init();
```

You can change the collection name:

```ts
const mongodbLockAdapter = new MongodbLockAdapter({
    database,
    // By default "lock" is used as collection name
    collectionName: "my-lock",
});

await mongodbLockAdapter.init();
```

You can change the collection settings:

```ts
const mongodbLockAdapter = new MongodbLockAdapter({
    database,
    // You configure additional collection settings
    collectionSettings: {},
});

await mongodbLockAdapter.init();
```

:::info
To remove the lock collection and all stored lock data, use `deInit` method:

```ts
await mongodbLockAdapter.deInit();
```

:::

:::danger
Note in order to use [`MongodbLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.MongodbLockAdapter.html) correctly, ensure you use a single, consistent database across all server instances or processes.
:::

## RedisLockAdapter

To use the [`RedisLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.RedisLockAdapter.html), you'll need to:

1. Install the required dependency: [`ioredis`](https://www.npmjs.com/package/ioredis) package

```ts
import { RedisLockAdapter } from "@daiso-tech/core/lock/adapters";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const redisLockAdapter = new RedisLockAdapter(database);
```

:::danger
Note in order to use `RedisLockAdapter` correctly, ensure you use a single, consistent database across all server instances or processes.
:::

## SqliteLockAdapter

To use the [`SqliteLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.SqliteLockAdapter.html), you'll need to:

1. Install the required dependency: [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) package

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { SqliteLockAdapter } from "@daiso-tech/core/lock/adapters";
import Sqlite from "better-sqlite3";

const sqliteLockAdapter = new SqliteLockAdapter({
    database,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await sqliteLockAdapter.init();
```

You can change the table name:

```ts
const sqliteLockAdapter = new SqliteLockAdapter({
    database,
    serde,
    // By default "lock" is used as table name
    tableName: "my-lock",
});

await sqliteLockAdapter.init();
```

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const sqliteLockAdapter = new SqliteLockAdapter({
    database,
    serde,
    // By default, the interval is 1 minute
    expiredKeysRemovalInterval: TimeSpan.fromSeconds(10),
});

await sqliteLockAdapter.init();
```

Disabling scheduled interval cleanup of expired keys:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const sqliteLockAdapter = new SqliteLockAdapter({
    database,
    serde,
    shouldRemoveExpiredKeys: false,
});

await sqliteLockAdapter.init();

// You can remove all expired keys manually.
await sqliteLockAdapter.removeAllExpired();
```

:::info
To remove the lock table and all stored lock data, use `deInit` method:

```ts
await sqliteLockAdapter.deInit();
```

:::

:::danger
Note the [`SqliteLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.SqliteLockAdapter.html) is limited to single server usage and cannot be shared across multiple servers but it can be shared between different processes. To use it correctly, ensure all process instances access the same persisted database.

:::

## LibsqlLockAdapter

To use the [`LibsqlLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LibsqlLockAdapter.html), you'll need to:

1. Install the required dependency: [`@libsql/client`](https://www.npmjs.com/package/@libsql/client) package

```ts
import { LibsqlLockAdapter } from "@daiso-tech/core/lock/adapters";
import { createClient } from "@libsql/client";

const database = createClient({ url: "file:local.db" });
const libsqlLockAdapter = new LibsqlLockAdapter({
    database,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await libsqlLockAdapter.init();
```

You can change the table name:

```ts
const libsqlLockAdapter = new LibsqlLockAdapter({
    database,
    // By default "lock" is used as table name
    tableName: "my-lock",
});

await libsqlLockAdapter.init();
```

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const libsqlLockAdapter = new LibsqlLockAdapter({
    database,
    serde,
    // By default, the interval is 1 minute
    expiredKeysRemovalInterval: TimeSpan.fromSeconds(10),
});

await libsqlLockAdapter.init();
```

Disabling scheduled interval cleanup of expired keys:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const libsqlLockAdapter = new LibsqlLockAdapter({
    database,
    serde,
    shouldRemoveExpiredKeys: false,
});

await libsqlLockAdapter.init();

// You can remove all expired keys manually.
await libsqlLockAdapter.removeAllExpired();
```

:::info
To remove the lock table and all stored lock data, use `deInit` method:

```ts
await libsqlLockAdapter.deInit();
```

:::

:::danger
Note in order to use [`LibsqlLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LibsqlLockAdapter.html) correctly, ensure you use a single, consistent database across all server instances. This means you can't use libsql [`embedded replicas`](https://docs.turso.tech/features/embedded-replicas/introduction).
:::

## NoOpLockAdapter

The [`NoOpLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.NoOpLockAdapter.html) is a no-operation implementation, it performs no actions when called:

```ts
import { NoOpLockAdapter } from "@daiso-tech/core/cache/adapters";

const noOpLockAdapter = new NoOpLockAdapter();
```

:::info
The [`NoOpLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.NoOpLockAdapter.html) is useful when you want to mock out or disable your [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html) instance.
:::

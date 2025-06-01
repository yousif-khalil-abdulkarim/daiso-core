---
sidebar_position: 1
---

# Using cache adapters

## MemoryCacheAdapter

To use the [`MemoryCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.MemoryCacheAdapter.html) you only need to create instance of it:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/adapters";

const memoryCacheAdapter = new MemoryCacheAdapter();
```

You can also provide an `Map` that will be used for storing the data in memory:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/adapters";

const map = new Map<any, any>();
const memoryCacheAdapter = new MemoryCacheAdapter(map);
```

:::info
[`MemoryCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.MemoryCacheAdapter.html) lets you test your app without external dependencies like `Redis`, ideal for local development, unit tests, integration tests and fast E2E test for the backend application.
:::

## MongodbCacheAdapter

To use the [`MongodbCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.MongodbCacheAdapter.html), you'll need to:

1. Install the required dependency: [`mongodb`](https://www.npmjs.com/package/mongodb) package
2. Provide a string serializer ([`ISerde`](docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](docs/Serde/serde_usage) for this purpose

```ts
import { MongodbCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");
const serde = new Serde(new SuperJsonSerdeAdapter());
const mongodbCacheAdapter = new MongodbCacheAdapter({
    database,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the indexes will be created
await mongodbCacheAdapter.init();
```

You can change the collection name:

```ts
const mongodbCacheAdapter = new MongodbCacheAdapter({
    database,
    serde,
    // By default "cache" is used as collection name
    collectionName: "my-cache",
});

await mongodbCacheAdapter.init();
```

You can change the collection settings:

```ts
const mongodbCacheAdapter = new MongodbCacheAdapter({
    database,
    serde,
    // You configure additional collection settings
    collectionSettings: {},
});

await mongodbCacheAdapter.init();
```

:::info
To remove the cache collection and all stored cache data, use `deInit` method:

```ts
await mongodbCacheAdapter.deInit();
```

:::

## RedisCacheAdapter

To use the [`RedisCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.RedisCacheAdapter.html), you'll need to:

1. Install the required dependency: [`ioredis`](https://www.npmjs.com/package/ioredis) package
2. Provide a string serializer ([`ISerde`](docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](docs/Serde/serde_usage) for this purpose

```ts
import { RedisCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());
const redisCacheAdapter = new RedisCacheAdapter({
    database,
    serde,
});
```

## SqliteCacheAdapter

To use the [`SqliteCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.SqliteCacheAdapter.html), you'll need to:

1. Install the required dependency: [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) package
2. Provide a string serializer ([`ISerde`](docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](docs/Serde/serde_usage) for this purpose

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { SqliteCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Sqlite from "better-sqlite3";

const database = new Sqlite("local.db");
const serde = new Serde(new SuperJsonSerdeAdapter());
const sqliteCacheAdapter = new SqliteCacheAdapter({
    database,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await sqliteCacheAdapter.init();
```

You can change the table name:

```ts
const sqliteCacheAdapter = new SqliteCacheAdapter({
    database,
    serde,
    // By default "cache" is used as table name
    tableName: "my-cache",
});

await sqliteCacheAdapter.init();
```

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const sqliteCacheAdapter = new SqliteCacheAdapter({
    database,
    serde,
    // By default, the interval is 1 minute
    expiredKeysRemovalInterval: TimeSpan.fromSeconds(10),
});

await sqliteCacheAdapter.init();
```

Disabling scheduled interval cleanup of expired keys:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const sqliteCacheAdapter = new SqliteCacheAdapter({
    database,
    serde,
    shouldRemoveExpiredKeys: false,
});

await sqliteCacheAdapter.init();

// You can remove all expired keys manually.
await sqliteCacheAdapter.removeAllExpired();
```

:::info
To remove the cache table and all stored cache data, use `deInit` method:

```ts
await sqliteCacheAdapter.deInit();
```

:::

## LibsqlCacheAdapter

To use the [`LibsqlCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.LibsqlCacheAdapter.html), you'll need to:

1. Install the required dependency: [`@libsql/client`](https://www.npmjs.com/package/@libsql/client) package
2. Provide a string serializer ([`ISerde`](docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](docs/Serde/serde_usage) for this purpose

```ts
import { LibsqlCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { createClient } from "@libsql/client";

const database = createClient({ url: "file:local.db" });
const serde = new Serde(new SuperJsonSerdeAdapter());
const libsqlCacheAdapter = new LibsqlCacheAdapter({
    database,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await libsqlCacheAdapter.init();
```

You can change the table name:

```ts
const libsqlCacheAdapter = new LibsqlCacheAdapter({
    database,
    serde,
    // By default "cache" is used as table name
    tableName: "my-cache",
});

await libsqlCacheAdapter.init();
```

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const libsqlCacheAdapter = new LibsqlCacheAdapter({
    database,
    serde,
    // By default, the interval is 1 minute
    expiredKeysRemovalInterval: TimeSpan.fromSeconds(10),
});

await libsqlCacheAdapter.init();
```

Disabling scheduled interval cleanup of expired keys:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const libsqlCacheAdapter = new LibsqlCacheAdapter({
    database,
    serde,
    shouldRemoveExpiredKeys: false,
});

await libsqlCacheAdapter.init();

// You can remove all expired keys manually.
await libsqlCacheAdapter.removeAllExpired();
```

:::info
You can disable transactions for increment and decrement operations. This is useful because, due to a bug, transactions do not work when running LibSQL in-memory mode. [Github thread](https://github.com/tursodatabase/libsql-client-ts/issues/229):

```ts
const libsqlCacheAdapter = new LibsqlCacheAdapter({
    database,
    serde,
    disableTransaction: true,
});

await libsqlCacheAdapter.init();
```

:::

:::info
To remove the cache table and all stored cache data, use `deInit` method:

```ts
await libsqlCacheAdapter.deInit();
```

:::

## NoOpCacheAdapter

The [`NoOpCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.NoOpCacheAdapter.html) is a no-operation implementation, it performs no actions when called:

```ts
import { NoOpCacheAdapter } from "@daiso-tech/core/cache/adapters";

const noOpCacheAdapter = new NoOpCacheAdapter();
```

:::info
The [`NoOpCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.NoOpCacheAdapter.html) is useful when you want to mock out or disable your [`Cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Cache.html) instance.
:::

:::info
Note [`NoOpCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.NoOpCacheAdapter.html) returns always null when retrieving items and return true when adding, updating, and removing items.
:::

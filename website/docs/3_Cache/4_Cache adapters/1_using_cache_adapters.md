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
2. Provide a string serializer ([`ISerde`](/docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](/docs/Serde/serde_usage) for this purpose

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
2. Provide a string serializer ([`ISerde`](/docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](/docs/Serde/serde_usage) for this purpose

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

## KyselyCacheAdapter

To use the [`KyselyCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.KyselyCacheAdapter.html), you'll need to:

1. Install the required dependency: [`kysely`](https://www.npmjs.com/package/kysely) package
2. Provide a string serializer ([`ISerde`](/docs/Serde/serde_usage))

-   We recommend using [`SuperJsonSerdeAdapter`](/docs/Serde/serde_usage) for this purpose

### Usage with Sqlite

You will need to install [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const database = new Sqlite("DATABASE_NAME.db");
const kysely = new Kysely({
    dialect: new SqliteDialect({
        database,
    }),
});
const serde = new Serde(new SuperJsonSerdeAdapter());
const kyselyCacheAdapter = new KyselyCacheAdapter({
    kysely,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyCacheAdapter.init();
```

### Usage with Postgres

You will need to install [`pg`](https://www.npmjs.com/package/pg) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const database = new Pool({
    database: "DATABASE_NAME",
    host: "DATABASE_HOST",
    user: "DATABASE_USER",
    // DATABASE port
    port: 5432,
    password: "DATABASE_PASSWORD",
    max: 10,
})
const kysely = new Kysely({
    dialect: new PostgresDialect({
        pool: database,
    }),
});
const serde = new Serde(new SuperJsonSerdeAdapter());
const kyselyCacheAdapter = new KyselyCacheAdapter({
    kysely,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyCacheAdapter.init();
```

### Usage with Mysql

You will need to install [`mysql2`](https://www.npmjs.com/package/mysql2) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";

const database = createPool({
    host: "DATABASE_HOST",
    // Database port
    port: 3306,
    database: "DATABASE_NAME",
    user: "DATABASE_USER",
    password: "DATABASE_PASSWORD",
    connectionLimit: 10,
});
const kysely = new Kysely({
    dialect: new MysqlDialect({
        pool: database,
    }),
});
const serde = new Serde(new SuperJsonSerdeAdapter());
const kyselyCacheAdapter = new KyselyCacheAdapter({
    kysely,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyCacheAdapter.init();
```

### Usage with Libsql

You will need to install [`@libsql/kysely-libsql`](https://www.npmjs.com/package/@libsql/kysely-libsql) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { LibsqlDialect }  from "@libsql/kysely-libsql";
import { Kysely } from "kysely";

const kysely = new Kysely({
    dialect: new LibsqlDialect({
        url: "DATABASE_URL",
    }),
});
const serde = new Serde(new SuperJsonSerdeAdapter());
const kyselyCacheAdapter = new KyselyCacheAdapter({
    kysely,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyCacheAdapter.init();
```

### Usage with other databases

Note [`kysely`](https://www.npmjs.com/package/kysely) has support for multiple [databases](https://github.com/kysely-org/awesome-kysely?tab=readme-ov-file#dialects).

:::danger
Before choose a database, ensure it supports transactions. Without transaction support,
you won't be able to use following methods `put` and `increment`, as they require transactional functionality.
:::

### Settings

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const kyselyCacheAdapter = new KyselyCacheAdapter({
    database,
    serde,
    // By default, the interval is 1 minute
    expiredKeysRemovalInterval: TimeSpan.fromSeconds(10),
});

await kyselyCacheAdapter.init();
```

Disabling scheduled interval cleanup of expired keys:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const kyselyCacheAdapter = new KyselyCacheAdapter({
    database,
    serde,
    shouldRemoveExpiredKeys: false,
});

await kyselyCacheAdapter.init();

// You can remove all expired keys manually.
await kyselyCacheAdapter.removeAllExpired();
```

:::info
To remove the cache table and all stored cache data, use `deInit` method:

```ts
await kyselyCacheAdapter.deInit();
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

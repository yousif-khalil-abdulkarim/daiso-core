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

## KyselyLockAdapter

To use the [`KyselyLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.KyselyLockAdapter.html), you'll need to:

1. Install the required dependency: [`kysely`](https://www.npmjs.com/package/kysely) package

### Usage with Sqlite

You will need to install [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyLockAdapter } from "@daiso-tech/core/lock/adapters";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const database = new Sqlite("DATABASE_NAME.db");
const kysely = new Kysely({
    dialect: new SqliteDialect({
        database,
    }),
});
const kyselyLockAdapter = new KyselyLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyLockAdapter.init();
```

:::danger
Note using [`KyselyLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.KyselyLockAdapter.html) with `sqlite` is limited to single server usage and cannot be shared across multiple servers but it can be shared between different processes. To use it correctly, ensure all process instances access the same persisted database.
:::

### Usage with Postgres

You will need to install [`pg`](https://www.npmjs.com/package/pg) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyLockAdapter } from "@daiso-tech/core/lock/adapters";
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
const kyselyLockAdapter = new KyselyLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyLockAdapter.init();
```

:::danger
Note in order to use [`KyselyLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.KyselyLockAdapter.html) with `postgres` correctly, ensure you use a single, consistent database across all server instances. This means you can't use replication.
:::

### Usage with Mysql

You will need to install [`mysql2`](https://www.npmjs.com/package/mysql2) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyLockAdapter } from "@daiso-tech/core/lock/adapters";
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
const kyselyLockAdapter = new KyselyLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyLockAdapter.init();
```

:::danger
Note in order to use [`KyselyLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.KyselyLockAdapter.html) with `mysql` correctly, ensure you use a single, consistent database across all server instances. This means you can't use replication.
:::

### Usage with Libsql

You will need to install [`@libsql/kysely-libsql`](https://www.npmjs.com/package/@libsql/kysely-libsql) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselyLockAdapter } from "@daiso-tech/core/lock/adapters";
import { LibsqlDialect }  from "@libsql/kysely-libsql";
import { Kysely } from "kysely";

const kysely = new Kysely({
    dialect: new LibsqlDialect({
        url: "DATABASE_URL",
    }),
});
const kyselyLockAdapter = new KyselyLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyLockAdapter.init();
```

:::danger
Note in order to use [`KyselyLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.KyselyLockAdapter.html) with `libsql` correctly, ensure you use a single, consistent database across all server instances. This means you can't use libsql embedded replicas.
:::

### Settings

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const kyselyLockAdapter = new KyselyLockAdapter({
    database,
    // By default, the interval is 1 minute
    expiredKeysRemovalInterval: TimeSpan.fromSeconds(10),
});

await kyselyLockAdapter.init();
```

Disabling scheduled interval cleanup of expired keys:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const kyselyLockAdapter = new KyselyLockAdapter({
    database,
    shouldRemoveExpiredKeys: false,
});

await kyselyLockAdapter.init();

// You can remove all expired keys manually.
await kyselyLockAdapter.removeAllExpired();
```

:::info
To remove the lock table and all stored lock data, use `deInit` method:

```ts
await kyselyLockAdapter.deInit();
```

:::

## NoOpLockAdapter

The [`NoOpLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.NoOpLockAdapter.html) is a no-operation implementation, it performs no actions when called:

```ts
import { NoOpLockAdapter } from "@daiso-tech/core/lock/adapters";

const noOpLockAdapter = new NoOpLockAdapter();
```

:::info
The [`NoOpLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.NoOpLockAdapter.html) is useful when you want to mock out or disable your [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html) instance.
:::

# Cache adapters

## Using Cache adapters

### MemoryCacheAdapter

To use the `MemoryCacheAdapter` you only need to create instance of it:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";

const memoryCacheAdapter = new MemoryCacheAdapter();
```

You can also provide an `Map` that will be used for storing the data in memory:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/memory-cache-adapter";

const map = new Map<any, any>();
const memoryCacheAdapter = new MemoryCacheAdapter(map);
```

:::info
`MemoryCacheAdapter` lets you test your app without external dependencies like `Redis`, ideal for local development, unit tests, integration tests and fast E2E test for the backend application.
:::

### MongodbCacheAdapter

To use the `MongodbCacheAdapter`, you'll need to:

1. Install the required dependency: [`mongodb`](https://www.npmjs.com/package/mongodb) package
2. Provide a string serializer ([`ISerde`](../Serde.md))

-   We recommend using `SuperJsonSerdeAdapter` for this purpose

```ts
import { MongodbCacheAdapter } from "@daiso-tech/core/cache/mongodb-cache-adapter";
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

### RedisCacheAdapter

To use the `RedisCacheAdapter`, you'll need to:

1. Install the required dependency: [`ioredis`](https://www.npmjs.com/package/ioredis) package
2. Provide a string serializer ([`ISerde`](../Serde.md))

-   We recommend using `SuperJsonSerdeAdapter` for this purpose

```ts
import { RedisCacheAdapter } from "@daiso-tech/core/cache/redis-cache-adapter";
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

### KyselyCacheAdapter

To use the `KyselyCacheAdapter`, you'll need to:

1. Install the required dependency: [`kysely`](https://www.npmjs.com/package/kysely) package
2. Provide a string serializer ([`ISerde`](../Serde.md))

-   We recommend using `SuperJsonSerdeAdapter` for this purpose

#### Usage with Sqlite

You will need to install [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) package:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/kysely-cache-adapter";
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

#### Usage with Postgres

You will need to install [`pg`](https://www.npmjs.com/package/pg) package:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/kysely-cache-adapter";
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

#### Usage with Mysql

You will need to install [`mysql2`](https://www.npmjs.com/package/mysql2) package:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/kysely-cache-adapter";
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

#### Usage with Libsql

You will need to install [`@libsql/kysely-libsql`](https://www.npmjs.com/package/@libsql/kysely-libsql) package:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";
import { KyselyCacheAdapter } from "@daiso-tech/core/cache/kysely-cache-adapter";
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

#### Usage with other databases

Note [`kysely`](https://www.npmjs.com/package/kysely) has support for multiple [databases](https://github.com/kysely-org/awesome-kysely?tab=readme-ov-file#dialects).

:::danger
Before choose a database, ensure it supports transactions. Without transaction support,
you won't be able to use following methods `put` and `increment`, as they require transactional functionality.
:::

#### Settings

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/time-span";

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
import { TimeSpan } from "@daiso-tech/core/time-span";

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

### NoOpCacheAdapter

The `NoOpCacheAdapter` is a no-operation implementation, it performs no actions when called:

```ts
import { NoOpCacheAdapter } from "@daiso-tech/core/cache/no-op-cache-adapter";

const noOpCacheAdapter = new NoOpCacheAdapter();
```

:::info
The `NoOpCacheAdapter` is useful when you want to mock out or disable your `Cache` class instance.
:::

:::info
Note `NoOpCacheAdapter` returns always null when retrieving items and return true when adding, updating, and removing items.
:::


## Creating cache adapters

### Implementing your custom ICacheAdapter

In order to create an adapter you need to implement the [`ICacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.ICacheAdapter.html) contract.

### Testing your custom ICacheAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`cacheAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Cache.cacheAdapterTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
// filename: MyCacheAdapter.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@daiso-tech/core/cache/test-utilities";
import { MemoryCacheAdapter } from "./MemoryCacheAdapter.js";

describe("class: MyCacheAdapter", () => {
    cacheAdapterTestSuite({
        createAdapter: () => new MemoryCacheAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

### Implementing your custom IDatabaseCacheAdapter

We provide an additional contract [`IDatabaseCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.IDatabaseCacheAdapter.html) for building custom cache adapters tailored to databases.

### Testing your custom IDatabaseCacheAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`databaseCacheAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Cache.databaseCacheAdapterTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
import { beforeEach, describe, expect, test } from "vitest";
import { databaseCacheAdapterTestSuite } from "@daiso-tech/core/cache/test-utilities";
import { MyDatabaseCacheAdapter } from "./MyDatabaseCacheAdapter.js";

describe("class: MyDatabaseCacheAdapter", () => {
    databaseCacheAdapterTestSuite({
        createAdapter: async () => {
            return new MyDatabaseCacheAdapter(),
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

### Implementing your custom ICache class

In some cases, you may need to implement a custom [`Cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.Cache.html) class to optimize performance for your specific technology stack. You can then directly implement the [`ICache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.ICache.html) contract.

### Testing your custom ICache class

We provide a complete test suite to verify your custom event bus class implementation. Simply use the [`cacheTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Cache.cacheTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
// filename: MyCache.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@daiso-tech/core/cache/test-utilities";
import { MyCache } from "./MyCache.js";

describe("class: MyCache", () => {
    cacheTestSuite({
        createCache: () => new MyCache(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Further information

For further information refer to [`@daiso-tech/core/cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Cache.html) API docs.
